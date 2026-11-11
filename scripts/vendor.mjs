import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const mappings = {
  docsify: ['lib/docsify.min.js', 'lib/plugins/search.js'],
  'docsify-themeable': ['dist/css/theme-simple.css', 'dist/js/docsify-themeable.min.js'],
  'docsify-pagination': ['dist/docsify-pagination.min.js'],
  'docsify-plugin-flexible-alerts': ['dist/docsify-plugin-flexible-alerts.min.js'],
  'docsify-katex': ['dist/docsify-katex.js'],
  'docsify-toc': ['dist/toc.js'],
  'docsify-sidebar-collapse': ['dist/docsify-sidebar-collapse.min.js'],
  prismjs: ['components/prism-java.min.js', 'components/prism-jsx.min.js', 'components/prism-typescript.min.js', 'components/prism-tsx.min.js'],
  katex: ['dist/katex.min.js', 'dist/katex.min.css', 'dist/fonts'],
};
const manifest = [];
for (const [name, files] of Object.entries(mappings)) {
  const source = path.join('node_modules', name);
  const target = path.join('docs/vendor', name);
  const pkg = JSON.parse(await readFile(path.join(source, 'package.json')));
  for (const file of files) {
    await mkdir(path.dirname(path.join(target, file)), { recursive: true });
    await cp(path.join(source, file), path.join(target, file), { recursive: true });
  }
  for (const license of (await readdir(source)).filter(x => /^(license|copying)/i.test(x))) {
    await cp(path.join(source, license), path.join(target, license));
  }
  const checksums = {};
  for (const file of files.filter(x => path.extname(x))) {
    checksums[file] = createHash('sha256').update(await readFile(path.join(source, file))).digest('hex');
  }
  manifest.push({ name, version: pkg.version, license: pkg.license, files: checksums });
}
await writeFile('docs/vendor/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Copied ${manifest.length} pinned packages with license notices.`);
