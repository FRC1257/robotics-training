#!/usr/bin/env python3
"""Check public documentation destinations without storing response bodies or credentials."""
from __future__ import annotations
import concurrent.futures, datetime, html, ipaddress, json, re, socket, urllib.error, urllib.parse, urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
OUTPUT = ROOT / 'research_sources/link-check.json'
TIMEOUT = 12
WORKERS = 6
SENSITIVE = re.compile(r'^(?:(?:access|refresh|id|oauth|auth)?[_-]?token|auth(?:orization)?|api[_-]?key|key|secret|password|passwd|signature|sig|x-amz-.+|x-goog-.+|code|jwt|credential|client[_-]?secret)$', re.I)


def clean(raw):
    raw = html.unescape(raw.strip().strip('<>'))
    try:
        url = urllib.parse.urlsplit(raw)
        if url.scheme.lower() not in ('http', 'https') or not url.hostname or url.username or url.password:
            return None
        host = url.hostname.lower().rstrip('.')
        if host == 'localhost' or host.endswith(('.localhost', '.local')): return None
        try:
            if not ipaddress.ip_address(host).is_global: return None
        except ValueError:
            pass  # Public DNS name; no DNS resolution in the inventory step.
        if any(SENSITIVE.match(k) for k, _ in urllib.parse.parse_qsl(url.query, keep_blank_values=True)):
            return None
        return urllib.parse.urlunsplit((url.scheme.lower(), url.netloc, url.path, url.query, ''))
    except ValueError:
        return None


class Links(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.found = []
    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name.lower() == 'href' and value:
                self.found.append((self.getpos()[0], value))


def markdown_links(text):
    # Inline destinations, including nested parentheses, and reference definitions.
    for m in re.finditer(r'!?\[[^\]\n]*\]\(\s*', text):
        i=m.end(); start=i; depth=0; quoted=False
        while i < len(text) and text[i] != '\n':
            c=text[i]
            if c == '\\': i += 2; continue
            if c == '(' and not quoted: depth += 1
            elif c == ')' and not quoted:
                if depth == 0: break
                depth -= 1
            elif c.isspace() and depth == 0: break
            i += 1
        yield text.count('\n', 0, start) + 1, text[start:i]
    for m in re.finditer(r'^\s{0,3}\[[^\]]+\]:\s*(<?https?://[^\s>]+>?)', text, re.M | re.I):
        yield text.count('\n', 0, m.start(1)) + 1, m.group(1)
    for m in re.finditer(r'<(https?://[^\s>]+)>', text, re.I):
        yield text.count('\n', 0, m.start(1)) + 1, m.group(1)
    # Docsify can autolink naked URLs; include embedded src URLs as references too.
    for m in re.finditer(r"https?://[^\s<>\"'`\[\]]+", text, re.I):
        raw = m.group(0).rstrip('.,;:!?*')
        while raw.endswith(')') and raw.count(')') > raw.count('('): raw = raw[:-1]
        yield text.count('\n', 0, m.start()) + 1, raw


class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def __init__(self): self.chain=[]
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        safe=clean(newurl)
        if not safe: raise urllib.error.URLError('redirect suppressed: sensitive or invalid destination')
        self.chain.append({'status':code,'url':safe})
        return super().redirect_request(req, fp, code, msg, headers, safe)


def attempt(url):
    started=datetime.datetime.now(datetime.timezone.utc).isoformat()
    redirect=SafeRedirect()
    opener=urllib.request.build_opener(redirect)
    request=urllib.request.Request(url, headers={'User-Agent':'FRC1257-training-link-check/1.0 (+https://github.com/FRC1257/robotics-training)'})
    try:
        with opener.open(request, timeout=TIMEOUT) as response:
            status=response.status; final=clean(response.geturl())
    except urllib.error.HTTPError as e:
        status=e.code; final=clean(e.geturl())
        e.close()
    except (urllib.error.URLError, TimeoutError, socket.timeout, OSError, ValueError) as e:
        return {'retrieved_at_utc':started, 'status':None, 'category':'blocked_or_unreachable', 'reason':type(e).__name__, 'redirects':redirect.chain}
    category = 'ok' if 200 <= status < 400 else ('blocked' if status in (401,403,405,429) else ('not_found' if status in (404,410) else 'http_error'))
    return {'retrieved_at_utc':started,'status':status,'category':category,'final_url':final,'redirects':redirect.chain}


def check(item):
    url, occurrences = item
    first=attempt(url); attempts=[first]
    if first['status'] in (404,410): attempts.append(attempt(url))
    confirmed = len(attempts) == 2 and all(a['status'] in (404,410) for a in attempts)
    return {'request_url':url,'occurrences':occurrences,'attempts':attempts,'confirmed_not_found':confirmed}


def main():
    found={}; skipped=0
    for path in sorted(DOCS.rglob('*')):
        if not path.is_file() or path.suffix.lower() not in ('.md','.html') or 'vendor' in path.relative_to(DOCS).parts:
            continue
        text=path.read_text(encoding='utf-8',errors='replace'); parser=Links(); parser.feed(text)
        for line, raw in [*markdown_links(text),*parser.found]:
            if not re.match(r'^<?https?://', raw, re.I): continue
            url=clean(raw)
            if not url: skipped+=1; continue
            occurrence={'path':path.relative_to(ROOT).as_posix(),'line':line,'historical': 'archive' in path.parts}
            if occurrence not in found.setdefault(url,[]): found[url].append(occurrence)
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        results=list(pool.map(check,sorted(found.items())))
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT.write_text(json.dumps({'generated_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'method':{'workers':WORKERS,'timeout_seconds':TIMEOUT,'request':'GET; fragments removed; 404/410 retried once','scope':'Markdown destinations, bare URLs, and HTML href/src references in docs; vendor excluded; archived pages flagged','security':'URLs with credentials, sensitive query keys, localhost or non-global IP literals omitted; sensitive redirects suppressed'},'skipped_sensitive_or_invalid_occurrences':skipped,'results':results},indent=2)+'\n')
    print(f'Checked {len(results)} distinct URLs; {sum(x["confirmed_not_found"] for x in results)} repeated 404/410; {sum(any(a["category"] in ("blocked","blocked_or_unreachable") for a in x["attempts"]) for x in results)} blocked/unreachable; {skipped} sensitive/invalid occurrences omitted. Output: {OUTPUT.relative_to(ROOT)}')

if __name__ == '__main__': main()
