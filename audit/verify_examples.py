"""Compile selected complete Java examples and reproduce PID arithmetic defects.

Historical reproducer pinned to the original audited revision, not a current-course test.
Does not modify lessons, run robot code, or validate hardware behavior.
"""
from pathlib import Path
import json
import re
import subprocess
import tempfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
BASELINE = "53ceaf61aeb80be597791c99bb50a3b123e8c71b"
def baseline_text(path):
    return subprocess.check_output(["git", "show", BASELINE + ":" + str(path.relative_to(ROOT))], cwd=ROOT, text=True)
results = []

def block(path):
    return re.findall(r'^```java\s*\n(.*?)^```', baseline_text(path), re.M | re.S)[0]

def compile_sources(label, sources, expected_success):
    with tempfile.TemporaryDirectory(prefix='frc-training-audit-') as d:
        paths = []
        for name, body in sources.items():
            p = Path(d) / name
            p.write_text(body)
            paths.append(str(p))
        r = subprocess.run(['javac', '-d', d, *paths], capture_output=True, text=True, timeout=30)
        results.append({'check': label, 'expected_success': expected_success,
                        'compile_success': r.returncode == 0,
                        'expectation_met': (r.returncode == 0) == expected_success,
                        'compiler_output': r.stderr.replace(d, '<temporary-directory>')})

for folder in ['1-Basics', '2-Control_Flow', '3-Functions']:
    for p in sorted((ROOT / 'docs/java' / folder / 'programs').glob('*.md')):
        if p.name == 'README.md':
            continue
        compile_sources(str(p.relative_to(ROOT)), {p.stem + '.java': block(p)}, True)

cars = ROOT / 'docs/java/4-Objects/programs/Cars'
compile_sources('Cars complete three-file example',
                {p.stem + '.java': block(p) for p in cars.glob('*.md') if p.name != 'README.md'}, True)

classes = ROOT / 'docs/java/4-Objects/2-Classes.md'
class_blocks = re.findall(r'^```java\s*\n(.*?)^```', baseline_text(classes), re.M | re.S)
bad_car = next(x for x in class_blocks if 'int distance(double time)' in x)
compile_sources('Classes lesson Actions Car as published', {'Car.java': bad_car}, False)

# Constant setpoint, measurement rises by 1 over 1s: de/dt = -1.
# A positive kD should contribute -1 to oppose that motion.
published_d = -1 * ((9 - 10) / 1)
correct_d = 1 * ((9 - 10) / 1)
results.append({'check': 'D sign with error=setpoint-measurement',
                'published_contribution': published_d, 'correct_contribution': correct_d,
                'defect_reproduced': published_d == -correct_d})
# After initialization, a fixed nonzero error must keep adding integral effort.
published_area = sum((2 - 2) * .02 for _ in range(50))
correct_area = sum(2 * .02 for _ in range(50))
results.append({'check': 'Integral accumulation over 1s constant error=2',
                'published_increment': published_area, 'correct_increment': correct_area,
                'defect_reproduced': published_area == 0 and abs(correct_area - 2) < 1e-10})

out = {'source_revision': BASELINE, 'checked_at_utc': datetime.now(timezone.utc).isoformat(),
       'javac': subprocess.run(['javac', '-version'], capture_output=True, text=True).stdout.strip(),
       'scope': 'Selected complete introductory Java examples compiled, not executed; one invalid lesson class compiled to reproduce error. Numerical PID checks, no dynamic or robot simulation.',
       'results': results}
(ROOT / 'audit/example-checks.json').write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps(out, indent=2))
