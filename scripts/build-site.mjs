import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import katex from "katex";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import { parseHTML } from "linkedom";
import {
  normalizeBase,
  outputPath,
  hrefFor,
  legacyRoutes,
  resolveReference,
} from "./site-paths.mjs";
loadLanguages([
  "java",
  "bash",
  "json",
  "python",
  "javascript",
  "typescript",
  "yaml",
  "markup",
  "css",
]);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  docs = path.join(root, "docs");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
// Official Lucide markup, read from the installed package so paths stay exact.
const lucide = path.join(root, "node_modules/lucide-static");
const iconCache = new Map();
function icon(name) {
  if (!iconCache.has(name))
    iconCache.set(
      name,
      fs
        .readFileSync(path.join(lucide, "icons", `${name}.svg`), "utf8")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*(\/?)>\s*/g, "$1>")
        .trim()
        .replace("<svg ", '<svg aria-hidden="true" focusable="false" '),
    );
  return iconCache.get(name);
}
let lucideNotice;
const iconLicense = () =>
  (lucideNotice ??=
    fs
      .readFileSync(path.join(lucide, "icons/search.svg"), "utf8")
      .match(/<!--\s*(@license[^>]*?)\s*-->/)?.[1] ||
    "@license lucide-static - ISC");
const slug = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-") || "section";
function walk(dir, rel = "") {
  return fs
    .readdirSync(path.join(dir, rel), { withFileTypes: true })
    .flatMap((d) => {
      const p = path.posix.join(rel, d.name);
      return d.isDirectory() ? walk(dir, p) : [p];
    });
}
function mathPlugin(md) {
  md.inline.ruler.before("escape", "math", (state, silent) => {
    const start = state.pos;
    if (state.src[start] !== "$" || state.src[start - 1] === "\\") return false;
    const display = state.src[start + 1] === "$",
      mark = display ? "$$" : "$",
      end = state.src.indexOf(mark, start + mark.length);
    if (end < 0 || end === start + mark.length) return false;
    if (!silent) {
      const token = state.push("math_inline", "", 0);
      token.content = state.src.slice(start + mark.length, end);
      token.meta = { display };
    }
    state.pos = end + mark.length;
    return true;
  });
  md.renderer.rules.math_inline = (tokens, i) =>
    katex.renderToString(tokens[i].content, {
      displayMode: tokens[i].meta.display,
      throwOnError: false,
      strict: "ignore",
    });
}
function makeMarkdown() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight: (str, lang) => {
      const language = Prism.languages[lang];
      return language
        ? `<pre class="language-${esc(lang)}"><code class="language-${esc(lang)}">${Prism.highlight(str, language, lang)}</code></pre>`
        : "";
    },
  });
  mathPlugin(md);
  return md;
}
function rawText(document) {
  return (document.querySelector("article")?.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}
function titleOf(markdown, source) {
  const found = markdown.match(/^#\s+(.+)$/m);
  return found
    ? found[1].replace(/[`*_]/g, "").trim()
    : path.posix.basename(source, ".md").replaceAll("_", " ");
}
function renderArticle(md, markdown, source, base, catalog) {
  let rendered = md.render(markdown);
  // Generated path links use docs-root paths so the resolver below applies the base.
  if (rendered.includes("<!-- learning-paths -->"))
    rendered = rendered.replace("<!-- learning-paths -->", pathList(catalog));
  if (source === "guides/learning-paths.md")
    rendered = rendered.replace(/<h2[\s>]/, (h2) => pathOverview(catalog) + h2);
  const { document } = parseHTML(
    `<html><body><article>${rendered}</article></body></html>`,
  );
  const article = document.querySelector("article"),
    counts = new Map(),
    toc = [];
  for (const h of article.querySelectorAll("h1,h2,h3")) {
    const name = h.textContent.trim(),
      key = slug(name),
      n = counts.get(key) || 0;
    counts.set(key, n + 1);
    h.id = n ? `${key}-${n}` : key;
    if (h.tagName === "H2") toc.push({ id: h.id, text: name });
  }
  for (const el of article.querySelectorAll("a[href],img[src]")) {
    const attr = el.tagName === "A" ? "href" : "src",
      raw = el.getAttribute(attr),
      result = resolveReference(raw, source, docs, base);
    if (result === null) {
      el.removeAttribute(attr);
      el.setAttribute("title", `Unavailable local reference: ${raw}`);
      el.classList.add("unavailable-reference");
    } else el.setAttribute(attr, result);
    const title = el.getAttribute("title");
    if (title?.startsWith(":ignore")) el.removeAttribute("title");
    if (title?.startsWith(":size=")) {
      const m = title.match(/:size=(\d*)x(\d*)/);
      if (m?.[1]) el.setAttribute("width", m[1]);
      if (m?.[2]) el.setAttribute("height", m[2]);
      el.removeAttribute("title");
    }
  }
  let embedNumber = 0;
  for (const iframe of article.querySelectorAll("iframe:not([title])")) {
    embedNumber++;
    let provider = "external";
    try {
      provider = new URL(iframe.getAttribute("src")).hostname;
    } catch {}
    iframe.setAttribute(
      "title",
      `${titleOf(markdown, source)}: ${provider} resource ${embedNumber}`,
    );
    iframe.setAttribute("loading", "lazy");
  }
  return { html: article.innerHTML, text: rawText(document), toc };
}
function decorateLab(html, source, base) {
  const { document } = parseHTML(html),
    body = document.querySelector("body");
  body.setAttribute("data-page-id", source);
  body.setAttribute("data-page-title", document.title || "Interactive lab");
  body.setAttribute("data-base", base);
  for (const a of document.querySelectorAll("a[href]")) {
    const raw = a.getAttribute("href");
    if (!/^(?:\.\.\/|\.\/)*#\//.test(raw)) continue;
    const resolved = resolveReference(raw, source, docs, base);
    if (resolved) a.setAttribute("href", resolved);
  }
  const toolbar = document.createElement("section");
  toolbar.setAttribute("class", "course-toolbar");
  toolbar.setAttribute("aria-label", "Course progress");
  toolbar.innerHTML = `<a href="${esc(hrefFor("labs/README.md", base))}">Course labs</a> <button id="complete-lesson" type="button" data-lesson="${esc(source)}" data-label="Mark lab complete">Mark lab complete</button> <span id="progress-summary">Progress is available when JavaScript is enabled.</span><span id="site-status" role="status" aria-live="polite"></span>`;
  body.prepend(toolbar);
  const style = document.createElement("style");
  style.textContent =
    ".course-toolbar{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;padding:.75rem 1rem;background:#e3edf5;color:#172339}.course-toolbar a{color:#075d93}.course-toolbar button{font:inherit}.course-toolbar span{font-size:.9rem}";
  document.head.append(style);
  const script = document.createElement("script");
  script.type = "module";
  script.src = base + "assets/site.mjs";
  body.append(script);
  return document.toString();
}
function notFound(base) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Team 1257</title><link rel="stylesheet" href="${esc(base)}assets/site.css"><script type="module" src="${esc(base)}assets/site.mjs"></script></head><body data-base="${esc(base)}" data-page-id="404" data-page-title="Page not found"><main id="main" class="lesson"><h1>Page not found</h1><p>The lesson may have moved. Try the home page or search the training library.</p><p><a href="${esc(base)}">Go to the home page</a> <button id="search-open" type="button">Search lessons</button></p><dialog id="search-dialog" aria-labelledby="search-title"><h2 id="search-title">Search lessons</h2><button id="search-close" type="button">Close</button><label for="search-input">Search by topic</label><input id="search-input" type="search"><p id="search-status" role="status"></p><ul id="search-results"></ul></dialog><p id="site-status" role="status" aria-live="polite"></p><noscript>Search and automatic legacy link redirects require JavaScript.</noscript></main></body></html>`;
}

// _sidebar.md lines are either links or plain group labels ("* Guides").
function sidebarEntries(all, base) {
  const text = fs.readFileSync(path.join(docs, "_sidebar.md"), "utf8");
  const entries = [];
  for (const line of text.split(/\r?\n/)) {
    const link = line.match(/^(\s*)\* \[([^\]]+)\]\(([^)]+)\)/),
      group = !link && line.match(/^(\s*)\* ([^[\s].*?)\s*$/);
    if (group) {
      entries.push({
        label: group[2].replace(/`/g, ""),
        depth: Math.floor(group[1].length / 2),
      });
      continue;
    }
    if (!link) continue;
    const href = resolveReference(link[3], "README.md", docs, base);
    if (!href) continue;
    const target = all.find((a) => hrefFor(a, base) === href);
    entries.push({
      label: link[2].replace(/`/g, ""),
      href,
      source: target,
      depth: Math.floor(link[1].length / 2),
    });
  }
  return entries;
}
function navTree(entries) {
  const top = { children: [] },
    stack = [{ depth: -1, node: top }];
  for (const entry of entries) {
    while (stack.at(-1).depth >= entry.depth) stack.pop();
    const node = { ...entry, children: [] };
    stack.at(-1).node.children.push(node);
    stack.push({ depth: entry.depth, node });
  }
  return top.children;
}
// Branches holding the current page render open, so the tree needs no JS to read.
function sidebar(tree, current) {
  let count = 0;
  const contains = (node) =>
    node.source === current || node.children.some(contains);
  const render = (nodes) =>
    nodes
      .map((node) => {
        const label = esc(node.label),
          link = node.href
            ? `<a href="${esc(node.href)}"${node.source === current ? ' aria-current="page"' : ""}>${label}</a>`
            : "";
        if (!node.children.length)
          return `<li>${link || `<span class="nav-label">${label}</span>`}</li>`;
        const id = `nav-${++count}`,
          open = contains(node),
          state = `aria-expanded="${open}" aria-controls="${id}"`;
        const toggle = node.href
          ? `<button class="nav-twisty" type="button" ${state} aria-label="${label} pages">${icon("chevron-right")}</button>`
          : `<button class="nav-group-toggle" type="button" ${state}><span>${label}</span>${icon("chevron-right")}</button>`;
        return `<li class="nav-branch${node.href ? "" : " nav-group"}"><div class="nav-row">${link}${toggle}</div><ul id="${id}"${open ? "" : " hidden"}>${render(node.children)}</ul></li>`;
      })
      .join("");
  return `<nav aria-label="Lesson navigation"><ul class="nav-tree">${render(tree)}</ul></nav>`;
}
function readCatalog() {
  const catalogPath = path.join(root, "platform/catalog.json");
  return fs.existsSync(catalogPath)
    ? JSON.parse(fs.readFileSync(catalogPath, "utf8"))
    : { paths: [] };
}
const hours = (minutes) =>
  minutes < 90 ? `~${minutes} min` : `~${Math.round(minutes / 30) / 2} h`;
// The catalog repeats this caveat per path; the page states it once instead.
const pathSummary = (p) =>
  String(p.description || "")
    .replace(/\s*Time is an approximate self-paced estimate\.?/i, "")
    .trim();
function pathHooks(p, reveal) {
  return `data-path-id="${esc(p.id)}" data-path-lessons="${esc(JSON.stringify(p.lessons))}" data-progress-reveal="${reveal}"`;
}
function pathStatus(p) {
  return `<progress max="${p.lessons.length}" value="0" aria-label="${esc(p.title)} progress" hidden></progress> <span class="path-progress" data-path-progress="${esc(p.id)}" hidden></span>`;
}
const firstLesson = (p) => "/" + (p.lessons?.[0] || "guides/start-here.md");
// Home: a compact list; progress appears only once something is completed.
function pathList(catalog) {
  if (!catalog.paths.length) return "";
  return `<ul class="path-list">${catalog.paths
    .map(
      (p) =>
        `<li ${pathHooks(p, "started")}><a class="path-link" href="${esc(firstLesson(p))}">${esc(p.title)}</a><span class="path-meta">${p.lessons.length} activities · ${hours(p.estimatedMinutes)}</span><span class="path-desc">${esc(pathSummary(p))}</span><span class="path-status">${pathStatus(p)}</span></li>`,
    )
    .join("")}</ul>`;
}
// Learning paths page: the one home for path progress and progress tools.
function pathOverview(catalog) {
  if (!catalog.paths.length) return "";
  const rows = catalog.paths
    .map(
      (p) =>
        `<tr ${pathHooks(p, "always")}><td><a class="path-link" href="${esc(firstLesson(p))}">${esc(p.title)}</a></td><td>${p.lessons.length}</td><td>${hours(p.estimatedMinutes)}</td><td class="path-status">${pathStatus(p)}<noscript>Needs JavaScript</noscript></td></tr>`,
    )
    .join("");
  return `<h2>Paths at a glance</h2><p class="path-note">Times are approximate self-paced estimates. Each path link opens your next unfinished activity.</p><table class="path-table"><thead><tr><th scope="col">Path</th><th scope="col">Activities</th><th scope="col">Time</th><th scope="col">Progress</th></tr></thead><tbody>${rows}</tbody></table><div class="progress-panel"><p id="progress-summary">Progress is available when JavaScript is enabled.</p>${progressTools(true)}</div>`;
}
function progressTools(open = false) {
  return `<details class="progress-tools"${open ? " open" : ""}><summary>Manage progress</summary><div class="progress-tools-body"><p>Progress is saved locally in this browser.</p><button id="progress-export" type="button">Export progress</button><label for="progress-import">Import progress</label><input id="progress-import" type="file" accept="application/json,.json"><button id="progress-reset" type="button">Reset progress</button></div></details>`;
}
// Section landing pages and the learning-paths hub are not completable lessons.
const isLesson = (source) =>
  source !== "README.md" &&
  !source.endsWith("/README.md") &&
  source !== "guides/learning-paths.md";
const completionLabels = {
  "guides/knowledge-checks.md": [
    "Mark checks reviewed",
    "Reviewed · mark not reviewed",
  ],
};
function lessonActions(source) {
  const [label, done] = completionLabels[source] || [];
  const labels = label
    ? ` data-label="${esc(label)}" data-done-label="${esc(done)}"`
    : "";
  return `<div class="lesson-actions"><button id="complete-lesson" type="button" data-lesson="${esc(source)}"${labels}>${esc(label || "Mark lesson complete")}</button><p id="progress-summary">Progress is available when JavaScript is enabled.</p>${progressTools()}</div>`;
}
// Runs before first paint so a saved or system dark theme never flashes light.
const themeBoot = `<script>try{var t=localStorage.getItem("frc1257-theme");if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}</script>`;
// Without JS the drawer, toggles and search cannot work, so the tree is shown in place.
const noscriptStyle = `<noscript><style>#search-open,#theme-toggle,#menu-toggle,.nav-twisty,.nav-group-toggle svg{display:none!important}.nav-branch>ul[hidden]{display:block}@media (max-width:950px){.sidebar{position:static;transform:none;visibility:visible;width:auto;height:auto;box-shadow:none;border-right:0;border-bottom:1px solid var(--line)}}</style></noscript>`;
function siteHeader(base) {
  return `<header class="site-header"><!-- Icons: ${esc(iconLicense())}, see assets/LICENSE-Lucide.txt --><a class="site-logo" href="${esc(base)}" aria-label="Team 1257 training home"><img src="${esc(base)}media/1257snail.svg" alt="" width="32" height="32"><span>1257 <strong>Robotics Training</strong></span></a><div class="header-actions"><button id="search-open" class="icon-btn" type="button" aria-haspopup="dialog" aria-label="Search lessons" aria-keyshortcuts="Control+K Meta+K" data-tip="Search (Ctrl/⌘ K)">${icon("search")}</button><button id="theme-toggle" class="icon-btn" type="button" aria-label="Dark theme" aria-pressed="false" data-tip="Dark theme">${icon("moon")}${icon("sun")}</button><button id="menu-toggle" class="icon-btn" type="button" aria-expanded="false" aria-controls="sidebar" aria-label="Lesson menu" data-tip="Menu">${icon("menu")}${icon("x")}</button></div></header>`;
}
function searchDialog() {
  return `<dialog id="search-dialog" aria-labelledby="search-title"><div class="search-header"><h2 id="search-title">Search lessons</h2><button id="search-close" class="icon-btn" type="button" aria-label="Close search" data-tip="Close (Esc)">${icon("x")}</button></div><label for="search-input">Search by topic or keyword</label><input id="search-input" type="search" autocomplete="off"><p id="search-status" role="status" aria-live="polite">Search topics, code and troubleshooting across the whole library.</p><ul id="search-results"></ul></dialog>`;
}
function pageTemplate({
  source,
  title,
  description,
  html,
  toc,
  base,
  tree,
  prev,
  next,
}) {
  const href = hrefFor(source, base),
    origin = (process.env.SITE_ORIGIN || "https://frc1257.github.io").replace(
      /\/$/,
      "",
    ),
    canonical = origin + href,
    id = source;
  // A rail longer than a dozen entries stops being a summary; skip it.
  const tocHtml =
    toc.length && toc.length <= 12
      ? `<nav aria-label="On this page"><h2>On this page</h2><ul>${toc.map((t) => `<li><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`).join("")}</ul></nav>`
      : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Team 1257 Robotics Training</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(canonical)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)} | Team 1257 Robotics Training"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><link rel="icon" href="${esc(base)}media/1257snail.svg" type="image/svg+xml">${themeBoot}<link rel="stylesheet" href="${esc(base)}assets/katex.min.css"><link rel="stylesheet" href="${esc(base)}assets/site.css">${noscriptStyle}<script type="module" src="${esc(base)}assets/site.mjs"></script></head><body data-page-id="${esc(id)}" data-page-title="${esc(title)}" data-base="${esc(base)}"><a class="skip-link" href="#main">Skip to content</a><noscript><p class="noscript-note">Lessons and navigation are available without JavaScript. Search, progress, legacy link redirects, and interactive labs require JavaScript.</p></noscript>${siteHeader(base)}${searchDialog()}<progress id="reading-progress" value="0" max="100" aria-label="Reading progress"></progress><p id="site-status" role="status" aria-live="polite"></p><div class="site-layout"><aside id="sidebar" class="sidebar">${sidebar(tree, source)}</aside><main id="main" class="lesson"><article>${html}</article>${isLesson(source) ? lessonActions(id) : ""}<footer class="lesson-footer"><nav aria-label="Lesson progression">${prev ? `<a rel="prev" href="${esc(prev.href)}"><small>Previous</small><span>${esc(prev.label)}</span></a>` : ""}${next ? `<a rel="next" href="${esc(next.href)}"><small>Next</small><span>${esc(next.label)}</span></a>` : ""}</nav><p><a href="https://github.com/FRC1257/robotics-training/edit/main/docs/${source.split("/").map(encodeURIComponent).join("/")}">Edit this lesson</a> · <a href="https://raw.githubusercontent.com/FRC1257/robotics-training/main/docs/${source.split("/").map(encodeURIComponent).join("/")}">View source</a></p></footer></main><aside class="toc">${tocHtml}</aside></div><footer class="site-footer"><p>Team 1257 Robotics Training · Learn, experiment, and share what you discover.</p></footer></body></html>`;
}
export function buildSite({
  base = process.env.SITE_BASE || "/robotics-training/",
  outDir = path.join(root, "dist"),
} = {}) {
  base = normalizeBase(base);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const sources = walk(docs).filter(
    (p) => p.endsWith(".md") && !path.posix.basename(p).startsWith("_"),
  );
  const allEntries = sidebarEntries(sources, base),
    tree = navTree(allEntries),
    entries = allEntries.filter((e) => e.href),
    catalog = readCatalog(),
    md = makeMarkdown(),
    routeMap = {},
    search = [],
    urls = [];
  for (const source of sources) {
    const markdown = fs.readFileSync(path.join(docs, source), "utf8"),
      title = titleOf(markdown, source),
      article = renderArticle(md, markdown, source, base, catalog),
      description =
        article.text.slice(0, 157).trim() || `Team 1257 training: ${title}`,
      idx = entries.findIndex((e) => e.source === source),
      prev = idx > 0 ? entries[idx - 1] : null,
      next = idx >= 0 && idx + 1 < entries.length ? entries[idx + 1] : null;
    const destination = path.join(outDir, outputPath(source));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(
      destination,
      pageTemplate({
        source,
        title,
        description,
        html: article.html,
        toc: article.toc,
        base,
        tree,
        prev,
        next,
      }),
    );
    for (const route of legacyRoutes(source))
      routeMap[route] = hrefFor(source, base);
    search.push({
      id: source,
      title,
      href: hrefFor(source, base),
      text: article.text,
      excerpt: description,
      section:
        source.split("/")[0] === "README.md" ? "Home" : source.split("/")[0],
    });
    urls.push(
      (process.env.SITE_ORIGIN || "https://frc1257.github.io").replace(
        /\/$/,
        "",
      ) + hrefFor(source, base),
    );
  }
  for (const file of walk(docs)) {
    if (
      file.endsWith(".md") ||
      file === "index.html" ||
      file === "js/site.js" ||
      file.startsWith("vendor/")
    )
      continue;
    const dest = path.join(outDir, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (file.startsWith("labs/") && file.endsWith(".html"))
      fs.writeFileSync(
        dest,
        decorateLab(fs.readFileSync(path.join(docs, file), "utf8"), file, base),
      );
    else fs.copyFileSync(path.join(docs, file), dest);
  }
  for (const source of walk(docs).filter(
    (p) => p.startsWith("labs/") && p.endsWith(".html"),
  )) {
    const document = parseHTML(
      fs.readFileSync(path.join(docs, source), "utf8"),
    ).document;
    const title = document.querySelector("h1")?.textContent || source;
    const text =
      document.querySelector("main")?.textContent.replace(/\s+/g, " ").trim() ||
      "";
    search.push({
      id: source,
      title,
      href: base + source,
      text,
      excerpt: text.slice(0, 157),
      section: "labs",
    });
  }
  const assetDir = path.join(outDir, "assets");
  fs.mkdirSync(assetDir, { recursive: true });
  const platform = path.join(root, "platform");
  if (fs.existsSync(platform)) {
    for (const file of fs.readdirSync(platform))
      if (
        file.endsWith(".mjs") ||
        file === "site.css" ||
        file.endsWith(".json")
      )
        fs.copyFileSync(path.join(platform, file), path.join(assetDir, file));
  }
  const katexDist = path.join(root, "node_modules/katex/dist");
  fs.copyFileSync(
    path.join(katexDist, "katex.min.css"),
    path.join(assetDir, "katex.min.css"),
  );
  fs.copyFileSync(
    path.join(root, "node_modules/katex/LICENSE"),
    path.join(assetDir, "LICENSE-KaTeX.txt"),
  );
  fs.copyFileSync(
    path.join(root, "node_modules/prismjs/LICENSE"),
    path.join(assetDir, "LICENSE-Prism.txt"),
  );
  fs.copyFileSync(
    path.join(lucide, "LICENSE"),
    path.join(assetDir, "LICENSE-Lucide.txt"),
  );
  fs.cpSync(path.join(katexDist, "fonts"), path.join(assetDir, "fonts"), {
    recursive: true,
  });
  fs.writeFileSync(path.join(outDir, "404.html"), notFound(base));
  const origin = (
    process.env.SITE_ORIGIN || "https://frc1257.github.io"
  ).replace(/\/$/, "");
  fs.writeFileSync(
    path.join(outDir, "robots.txt"),
    `# Project copy; crawlers use robots.txt at the host root.\nSitemap: ${origin}${base}sitemap.xml\n`,
  );
  fs.writeFileSync(
    path.join(outDir, "route-map.json"),
    JSON.stringify(routeMap, null, 2),
  );
  fs.writeFileSync(
    path.join(outDir, "search-index.json"),
    JSON.stringify(search),
  );
  fs.writeFileSync(
    path.join(outDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${esc(url)}</loc></url>`).join("")}</urlset>`,
  );
  return { count: sources.length, routeMap, search };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = buildSite();
  console.log(`Built ${result.count} lessons.`);
}
