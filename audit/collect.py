"""Read-only, standard-library audit. Writes evidence only under audit/.

Markdown link extraction is deliberately a bounded heuristic, not a Docsify
renderer. Anchor validity, client routing, search and layout need browser QA.
"""
from pathlib import Path
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from urllib.parse import urlsplit, unquote, urljoin
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import hashlib
import json
import re
import subprocess
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
OUT = ROOT / 'audit'
BASE = 'https://frc1257.github.io/robotics-training/'
OUT.mkdir(exist_ok=True)
(OUT / 'snapshots').mkdir(exist_ok=True)

def save(name, value):
    (OUT / name).write_text(json.dumps(value, indent=2) + '\n')

def resolve(source, target):
    parsed = urlsplit(target)
    if target.startswith(BASE + '#/'):
        path = unquote(target.split('#/', 1)[1].split('?', 1)[0])
        candidate = DOCS / path
    elif parsed.scheme or parsed.netloc or target.startswith('#'):
        return None
    else:
        path = unquote(parsed.path)
        candidate = DOCS / path.lstrip('/') if path.startswith('/') else source.parent / path
    if candidate.is_dir():
        candidate = candidate / 'README.md'
    if not candidate.exists() and not candidate.suffix:
        candidate = candidate.with_suffix('.md')
    return candidate.resolve()

class Tags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.frames = []
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'iframe':
            self.frames.append(attrs)
        elif tag == 'script' and attrs.get('src'):
            self.scripts.append(attrs)

inventory, links, todos, media, code, embeds = [], [], [], [], [], []
for p in sorted(DOCS.rglob('*')):
    if not p.is_file():
        continue
    raw = p.read_bytes()
    rel = str(p.relative_to(ROOT))
    if p.suffix != '.md':
        media.append({'path': rel, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
        continue
    text = raw.decode('utf-8')
    fences = re.findall(r'^```([^\n]*)\n(.*?)^```\s*$', text, re.M | re.S)
    inventory.append({'path': rel, 'bytes': len(raw), 'words_whitespace_including_code': len(text.split()),
                      'sha256': hashlib.sha256(raw).hexdigest(),
                      'headings': re.findall(r'^#{1,6} (.+)$', text, re.M),
                      'code_blocks': len(fences)})
    code.extend({'path': rel, 'language': lang, 'code': body} for lang, body in fences)
    markup = re.sub(r'^```[^\n]*\n.*?^```[^\n]*', '', text, flags=re.M | re.S)
    parser = Tags()
    parser.feed(markup)
    embeds.extend({'path': rel, 'attributes': frame} for frame in parser.frames)
    in_fence = False
    for line_number, line in enumerate(text.splitlines(), 1):
        if line.startswith('```'):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if re.search(r'\bTODO\b|updated soon|updated later|will be updated some time|\bTBD\b', line, re.I):
            todos.append({'path': rel, 'line': line_number, 'text': line})
        # Supports ordinary destinations, one nested pair, optional Docsify title.
        for m in re.finditer(r'(!?)\[([^\]]*)\]\(([^\s()]*(?:\([^()]*\)[^\s()]*)?)(?:\s+[\'"][^\n]*?[\'"])?\)', line):
            target = m.group(3)
            candidate = resolve(p, target)
            links.append({'source': rel, 'line': line_number, 'image': bool(m.group(1)),
                          'label': m.group(2), 'target': target,
                          'local_target': str(candidate.relative_to(ROOT)) if candidate and candidate.is_relative_to(ROOT) else str(candidate) if candidate else None,
                          'local_exists': candidate.is_file() if candidate else None,
                          'resolution_caveat': 'Nested Docsify sidebar base needs renderer verification' if p.name == '_sidebar.md' and p.parent != DOCS else None})

save('inventory.json', inventory)
save('links.json', links)
save('todos.json', todos)
save('assets.json', sorted(media, key=lambda x: -x['bytes']))
save('code-blocks.json', code)
save('embeds.json', embeds)
parser = Tags()
parser.feed((DOCS / 'index.html').read_text())
save('scripts.json', parser.scripts)
missing = [x for x in links if x['local_exists'] is False]
sidebar_targets = {x['local_target'] for x in links if x['source'] == 'docs/_sidebar.md' and x['local_exists']}
summary = {
    'audited_at_utc': datetime.now(timezone.utc).isoformat(),
    'commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
    'markdown_files': len(inventory),
    'markdown_by_section': dict(Counter(x['path'].split('/')[1] for x in inventory)),
    'whitespace_words_including_code': sum(x['words_whitespace_including_code'] for x in inventory),
    'markdown_link_occurrences': len(links), 'missing_local_occurrences': len(missing),
    'missing_local_unique_targets': len({x['local_target'] for x in missing}),
    'missing_sidebar_links': [x for x in missing if x['source'] == 'docs/_sidebar.md'],
    'missing_local_links': missing,
    'pages_not_linked_directly_from_root_sidebar': [x['path'] for x in inventory if x['path'] not in sidebar_targets and Path(x['path']).name not in ('_sidebar.md', '_coverpage.md')],
    'todo_occurrences': len(todos), 'todo_files': len({x['path'] for x in todos}),
    'empty_files': [x['path'] for x in inventory if not x['bytes']],
    'script_tags_with_external_src': len(parser.scripts),
    'iframe_count_outside_code_fences': len(embeds),
    'iframes_without_title_attribute': len([x for x in embeds if not x['attributes'].get('title')]),
    'method_limits': ['Markdown destinations extracted heuristically; no reference-style links, anchors or rendered DOM validation.', 'Direct sidebar omission is not proof of an orphan.', 'All markdown files scanned; semantic deep review sampled the principal learning journeys.']
}
save('summary.json', summary)

urls = [BASE, BASE + 'robots.txt', BASE + 'sitemap.xml', 'https://frc1257.github.io/robots.txt',
        BASE + 'frc/5-Advanced_%26_Misc/Characterization-Sysid.md', BASE + 'frc/5-Advanced_%26_Misc/Sysid.md',
        BASE + 'frc/5-Advanced_%26_Misc/Advanced_Logging.md', BASE + 'README.md', BASE + 'index.html',
        'https://learnfrc.com/', 'https://frcdesign.org/', 'https://frcelectrical.org/',
        'https://spectrum3847.org/resources/training/', 'https://www.spartanrobotics.org/workshops',
        'https://docs.marswars.org/labs', 'https://team1241.github.io/',
        'https://docs.advantagescope.org/', 'https://docs.advantagekit.org/',
        'https://choreo.autos/', 'https://pathplanner.dev/',
        'https://docs.revrobotics.com/revlib/archive/24-to-present.md',
        'https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/introduction-to-pid.html',
        'https://docs.wpilib.org/en/stable/docs/software/commandbased/commands.html',
        'https://docs.wpilib.org/en/stable/docs/software/kinematics-and-odometry/swerve-drive-kinematics.html',
        'https://docs.wpilib.org/en/stable/docs/yearly-overview/yearly-changelog.html',
        'https://docs.wpilib.org/en/latest/docs/yearly-overview/yearly-changelog.html',
        'https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/multitag.html']
# Every local missing path gets a direct live check too; HTTP fetch omits hash routes.
urls += [urljoin(BASE, x['local_target'].removeprefix('docs/')) for x in missing if x['local_target'].startswith('docs/')]
# Check linked WPILib/vendor destinations, preserving source mapping in links.json.
urls += [x['target'] for x in links if urlsplit(x['target']).hostname in {'docs.wpilib.org', 'first.wpi.edu', 'docs.photonvision.org', 'docs.limelightvision.io', 'www.revrobotics.com'}]

def fetch(url):
    record = {'request_url': url, 'retrieved_at_utc': datetime.now(timezone.utc).isoformat(), 'method': 'GET'}
    try:
        try:
            response = urlopen(Request(url, headers={'User-Agent': 'FRC1257-training-audit/1.0'}), timeout=18)
        except HTTPError as e:
            response = e
        with response:
            body = response.read()
            digest = hashlib.sha256(body).hexdigest()
            name = hashlib.sha256(url.encode()).hexdigest()[:16] + '.raw'
            (OUT / 'snapshots' / name).write_bytes(body)
            record.update(status=response.status, final_url=response.url, bytes=len(body), sha256=digest,
                          snapshot='snapshots/' + name, headers={k:v for k,v in response.headers.items() if k.lower() not in ('set-cookie', 'set-cookie2')})
    except Exception as e:
        record['error'] = type(e).__name__ + ': ' + str(e)
    return record

with ThreadPoolExecutor(max_workers=8) as pool:
    http = list(pool.map(fetch, sorted(set(urls))))
save('http.json', http)
print(json.dumps({k:v for k,v in summary.items() if k not in ('missing_local_links','pages_not_linked_directly_from_root_sidebar')}, indent=2))
print('HTTP status counts', dict(Counter(str(x.get('status', 'error')) for x in http)))
print('HTTP non-200', json.dumps([{k:v for k,v in x.items() if k in ('request_url','status','error')} for x in http if x.get('status') != 200], indent=2))
