import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';
test('vendored dependencies match exact recorded files',async()=>{
  const packages=JSON.parse(await readFile('docs/vendor/manifest.json'));
  for(const pkg of packages)for(const [file,hash]of Object.entries(pkg.files))assert.equal(createHash('sha256').update(await readFile(`docs/vendor/${pkg.name}/${file}`)).digest('hex'),hash);
});
test('entry page permits zoom and loads local runtime assets',async()=>{
  const {document}=parseHTML(await readFile('docs/index.html','utf8'));
  assert.equal(document.documentElement.lang,'en');
  assert.equal(document.querySelector('meta[name="viewport"]').content,'width=device-width, initial-scale=1');
  for(const el of document.querySelectorAll('script[src]'))assert.ok(el.getAttribute('src').startsWith('./'));
  assert.ok(document.querySelector('.skip-link'));
});
