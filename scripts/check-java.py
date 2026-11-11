"""Compile the complete introductory Java programs; execute arithmetic checks."""
from pathlib import Path
import re
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
count = 0
with tempfile.TemporaryDirectory(prefix='training-java-') as directory:
    out = Path(directory)
    for section in ['1-Basics', '2-Control_Flow', '3-Functions']:
        for source in sorted((root/'docs/java'/section/'programs').glob('*.md')):
            if source.name == 'README.md':
                continue
            blocks = re.findall(r'^```java\s*\n(.*?)^```', source.read_text(), re.M | re.S)
            target = out/(source.stem+'.java')
            target.write_text(blocks[0])
            subprocess.run(['javac','-d',str(out),str(target)],check=True)
            count += 1
    cars=[]
    for source in (root/'docs/java/4-Objects/programs/Cars').glob('*.md'):
        if source.name == 'README.md':continue
        target=out/(source.stem+'.java')
        target.write_text(re.findall(r'^```java\s*\n(.*?)^```',source.read_text(),re.M|re.S)[0])
        cars.append(str(target))
    subprocess.run(['javac','-d',str(out),*cars],check=True)
    count += 1
    # Inline teaching sequence must compile too, not only the final project.
    classes = (root/'docs/java/4-Objects/2-Classes.md').read_text()
    inline = re.findall(r'^```java\s*\n(.*?)^```', classes, re.M | re.S)
    index = next(i for i, body in enumerate(inline) if 'double distance(double time)' in body)
    (out/'Car.java').write_text(inline[index])
    (out/'Main.java').write_text('public class Main {\n' + inline[index+1] + '\n}')
    subprocess.run(['javac','-d',str(out),str(out/'Car.java'),str(out/'Main.java')],check=True)
    subprocess.run(['javac','-d',str(out),str(root/'examples/PidDemo.java')],check=True)
    subprocess.run(['java','-cp',str(out),'PidDemo'],check=True)
print(f'Compiled {count} complete introductory program groups plus the inline Classes sequence, and passed PID arithmetic checks.')
