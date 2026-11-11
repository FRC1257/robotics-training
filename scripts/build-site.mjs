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
function renderArticle(md, markdown, source, base) {
  const { document } = parseHTML(
    `<html><body><article>${md.render(markdown)}</article></body></html>`,
  );
  const article = document.querySelector("article"),
    counts = new Map(),
    toc = [];
  if (source === "README.md") {
    const h = article.querySelector("h1");
    if (h) {
      const replacement = document.createElement("h2");
      replacement.innerHTML = h.innerHTML;
      h.replaceWith(replacement);
    }
  }
  for (const h of article.querySelectorAll("h1,h2,h3")) {
    const name = h.textContent.trim(),
      key = slug(name),
      n = counts.get(key) || 0;
    counts.set(key, n + 1);
    h.id = n ? `${key}-${n}` : key;
    if (h.tagName !== "H1")
      toc.push({ id: h.id, text: name, level: h.tagName });
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
  for (const iframe of article.querySelectorAll("iframe:not([title])"))
    iframe.setAttribute("title", "Embedded lesson resource");
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
  toolbar.innerHTML = `<a href="${esc(hrefFor("labs/README.md", base))}">Course labs</a> <button id="complete-lesson" type="button" data-lesson="${esc(source)}">Mark lab complete</button> <span id="progress-summary">Progress is available when JavaScript is enabled.</span><span id="site-status" role="status" aria-live="polite"></span>`;
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

const top = [
  ["Start Here", "guides/start-here.md"],
  ["Foundations", "foundations/README.md"],
  ["Java", "java/README.md"],
  ["Robot Programming", "frc/README.md"],
  ["Labs", "labs/README.md"],
  ["Real Robots", "robots/README.md"],
  ["Reference", "guides/resources.md"],
];
function sidebarEntries(all, base) {
  const text = fs.readFileSync(path.join(docs, "_sidebar.md"), "utf8");
  const entries = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(\s*)\* \[([^\]]+)\]\(([^)]+)\)/);
    if (!m) continue;
    const href = resolveReference(m[3], "README.md", docs, base);
    if (!href) continue;
    const target = all.find((a) => hrefFor(a, base) === href);
    entries.push({
      label: m[2].replace(/`/g, ""),
      href,
      source: target,
      depth: Math.floor(m[1].length / 2),
    });
  }
  return entries;
}
function sidebar(entries, current) {
  return `<nav aria-label="Lesson navigation"><ul>${entries.map((e) => `<li class="nav-depth-${e.depth}"><a href="${esc(e.href)}"${e.source === current ? ' aria-current="page"' : ""}>${esc(e.label)}</a></li>`).join("")}</ul></nav>`;
}
function homeHero(base) {
  const catalogPath = path.join(root, "platform/catalog.json");
  const catalog = fs.existsSync(catalogPath)
    ? JSON.parse(fs.readFileSync(catalogPath, "utf8"))
    : { paths: [] };
  const cards = catalog.paths
    .map((p) => {
      const first = p.lessons?.[0] || "guides/start-here.md";
      const href = first.endsWith(".md")
        ? hrefFor(first, base)
        : base + first.split("/").map(encodeURIComponent).join("/");
      return `<a class="path-card" data-path-id="${esc(p.id)}" data-path-lessons="${esc(JSON.stringify(p.lessons))}" href="${esc(href)}"><strong>${esc(p.title)}</strong><span>${esc(p.description)}</span><span>${esc(p.estimatedMinutes)} minutes · ${p.lessons.length} activities</span><progress max="${p.lessons.length}" value="0" aria-label="${esc(p.title)} progress"></progress><span class="path-progress" data-path-progress="${esc(p.id)}">Progress is stored in this browser when JavaScript is enabled.</span></a>`;
    })
    .join("");
  return `<section class="hero"><div><p class="eyebrow">TEAM 1257 · LEARNING LIBRARY</p><h1>Build the skills to build robots.</h1><p>Learn the ideas, test them in a lab, and connect each experiment to real robot code.</p><p><a class="button" href="${esc(hrefFor("guides/start-here.md", base))}">Start learning</a> <a href="${esc(hrefFor("labs/README.md", base))}">Explore the labs →</a></p></div><img src="${esc(base)}media/robots/foundations-system.svg" alt="" class="hero-illustration"></section><section aria-labelledby="paths-heading"><h2 id="paths-heading">Choose a learning path</h2><div class="path-cards">${cards}</div></section><section class="featured-labs"><h2>Try a hands-on lab</h2><p>Predict, experiment, and explain the result.</p><a href="${esc(base)}labs/pid.html">PID &amp; feedforward →</a> · <a href="${esc(base)}labs/swerve.html">Swerve kinematics →</a></section>`;
}
function pageTemplate({
  source,
  title,
  description,
  html,
  toc,
  base,
  entries,
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
  const tocHtml = toc.length
    ? `<nav aria-label="On this page"><h2>On this page</h2><ul>${toc.map((t) => `<li class="toc-${t.level.toLowerCase()}"><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`).join("")}</ul></nav>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Team 1257 Robotics Training</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(canonical)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)} | Team 1257 Robotics Training"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><link rel="icon" href="${esc(base)}media/1257snail.svg" type="image/svg+xml"><link rel="stylesheet" href="${esc(base)}assets/katex.min.css"><link rel="stylesheet" href="${esc(base)}assets/site.css"><script type="module" src="${esc(base)}assets/site.mjs"></script></head><body data-page-id="${esc(id)}" data-page-title="${esc(title)}" data-base="${esc(base)}"><a class="skip-link" href="#main">Skip to content</a><noscript>Lessons and navigation are available without JavaScript. Search, progress, legacy link redirects, and interactive labs require JavaScript.</noscript><header class="site-header"><a class="site-logo" href="${esc(base)}" aria-label="Team 1257 training home"><img src="${esc(base)}media/1257snail.svg" alt="" width="40" height="40"><span>1257 <strong>Robotics Training</strong></span></a><nav class="top-nav" aria-label="Main navigation">${top.map(([label, p]) => `<a href="${esc(hrefFor(p, base))}">${esc(label)}</a>`).join("")}</nav><button id="search-open" type="button" aria-haspopup="dialog">Search</button><button id="theme-toggle" type="button" aria-label="Toggle color theme">Theme</button><button id="menu-toggle" type="button" aria-expanded="false" aria-controls="sidebar">Menu</button></header><dialog id="search-dialog" aria-labelledby="search-title"><div class="search-header"><h2 id="search-title">Search lessons</h2><button id="search-close" type="button" aria-label="Close search">Close</button></div><label for="search-input">Search by topic or keyword</label><input id="search-input" type="search" autocomplete="off"><p id="search-status" role="status" aria-live="polite">Search topics, code and troubleshooting across the whole library.</p><ul id="search-results"></ul></dialog><progress id="reading-progress" value="0" max="100" aria-label="Reading progress"></progress><p id="site-status" role="status" aria-live="polite"></p><div class="site-layout"><aside id="sidebar" class="sidebar">${sidebar(entries, source)}</aside><main id="main" class="lesson">${source === "README.md" ? homeHero(base) : ""}<article>${html}</article><div class="lesson-actions"><button id="complete-lesson" type="button" data-lesson="${esc(id)}">Mark lesson complete</button><p id="progress-summary">Progress is available when JavaScript is enabled.</p><details class="progress-tools"><summary>Manage progress</summary><p>Progress is saved locally in this browser.</p><button id="progress-export" type="button">Export progress</button><label for="progress-import">Import progress</label><input id="progress-import" type="file" accept="application/json,.json"><button id="progress-reset" type="button">Reset progress</button></details></div><footer class="lesson-footer"><nav aria-label="Lesson progression">${prev ? `<a rel="prev" href="${esc(prev.href)}">← ${esc(prev.label)}</a>` : ""}${next ? `<a rel="next" href="${esc(next.href)}">${esc(next.label)} →</a>` : ""}</nav><p><a href="https://github.com/FRC1257/robotics-training/edit/main/docs/${source.split("/").map(encodeURIComponent).join("/")}">Edit this lesson</a> · <a href="https://raw.githubusercontent.com/FRC1257/robotics-training/main/docs/${source.split("/").map(encodeURIComponent).join("/")}">View source</a></p></footer></main><aside class="toc">${tocHtml}</aside></div><footer class="site-footer"><p>Team 1257 Robotics Training · Learn, experiment, and share what you discover.</p></footer></body></html>`;
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
  const entries = sidebarEntries(sources, base),
    md = makeMarkdown(),
    routeMap = {},
    search = [],
    urls = [];
  for (const source of sources) {
    const markdown = fs.readFileSync(path.join(docs, source), "utf8"),
      title = titleOf(markdown, source),
      article = renderArticle(md, markdown, source, base),
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
        entries,
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
