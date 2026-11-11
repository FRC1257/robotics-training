import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import { parseHTML } from 'linkedom';
const root = path.resolve('docs');
const md = new MarkdownIt({html:true});
async function walk(dir) { const files=[]; for(const e of await readdir(dir,{withFileTypes:true})) { if(e.name==='vendor')continue; const p=path.join(dir,e.name); if(e.isDirectory())files.push(...await walk(p));else files.push(p); }return files; }
const files = await walk(root), errors=[];
const exists = async p => {try {return (await stat(p)).isFile();}catch{return false;}};
async function resolveLink(source, target) {
  if (/^(https?:)?\/\//.test(target)) {
    const url=new URL(target,'https://frc1257.github.io');
    if(url.origin!=='https://frc1257.github.io'||!url.pathname.startsWith('/robotics-training/')||!url.hash.startsWith('#/'))return true;
    target=url.hash.slice(1);
  }
  if(/^(?:mailto:|data:|tel:|javascript:)/.test(target)||target.startsWith('#')&&!target.startsWith('#/'))return true;
  target=decodeURIComponent(target.replace(/^#\//,'/').split(/[?#]/)[0]);
  if(!target)return true;
  const candidates = target.startsWith('/') ? [path.join(root,target)] : [path.resolve(path.dirname(source),target),path.join(root,target)];
  for(const p of candidates)for(const v of [p,path.join(p,'README.md'),`${p}.md`])if(await exists(v))return true;
  return false;
}
let pages=0, links=0;
for(const file of files) {
  if(!/\.(md|html)$/.test(file))continue;
  const source=await readFile(file,'utf8');
  if(file.endsWith('.md')) {
    pages++;
    if(!source.trim())errors.push(`${file}: empty lesson`);
    const tokens=md.parse(source,{});
    for(const token of tokens)for(const child of token.children||[]) {
      const dest=child.type==='link_open'?child.attrGet('href'):child.type==='image'?child.attrGet('src'):null;
      if(dest){links++;if(!await resolveLink(file,dest))errors.push(`${path.relative(root,file)}: missing ${dest}`);}
    }
  } else {
    const {document}=parseHTML(source);
    if(!document.documentElement.getAttribute('lang'))errors.push(`${file}: missing document language`);
    if(document.querySelector('meta[name="viewport"]')?.content.includes('user-scalable=no'))errors.push(`${file}: zoom disabled`);
    for(const el of document.querySelectorAll('script[src],link[href],img[src]')) {
      const dest=el.getAttribute('src')||el.getAttribute('href');
      if(dest&&!await resolveLink(file,dest))errors.push(`${file}: missing asset ${dest}`);
    }
  }
}
console.log(`Checked ${pages} Markdown pages and ${links} Markdown destinations.`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('No missing local destinations, empty lessons or disabled zoom found.');
