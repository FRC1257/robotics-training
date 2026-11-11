import fs from "node:fs";
import { pageSeo, seoHead, writeSocialCard } from "./site-seo.mjs";
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
// IDs the page chrome owns. A heading whose slug lands on one gets a "heading-" prefix
// instead, so every other heading keeps the anchor it has always had.
const CHROME_IDS = new Set([
  "main", "sidebar", "site-status", "reading-progress", "theme-toggle", "menu-toggle",
  "search-open", "search-dialog", "search-title", "search-input", "search-clear",
  "search-close", "search-section", "search-status", "search-results", "search-retry",
  "search-widen", "search-empty", "complete-lesson", "progress-summary", "next-activity",
  "progress-export", "progress-import", "progress-reset", "404",
]);
const isChromeId = (id) => CHROME_IDS.has(id) || /^nav-\d+$/.test(id);
// Ring plus check; CSS fills the ring and draws the check when aria-pressed is true.
const completeIcon = `<svg class="complete-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><circle class="ring" cx="12" cy="12" r="9.25" pathLength="1"/><path class="check" d="m7.75 12.4 2.9 2.9 5.6-5.8" pathLength="1"/></svg>`;
function completionToggle({ id, source, auto, noun, label, tipOff, tipOn, statusOff, statusOn, extraClass = "" }) {
  return `<button${id ? ` id="${id}"` : ""} class="icon-btn complete-toggle${extraClass}" type="button" data-complete-toggle data-lesson="${esc(source)}"${auto ? ' data-auto="visit"' : ""} data-noun="${esc(noun)}" data-tip-off="${esc(tipOff)}" data-tip-on="${esc(tipOn)}" data-status-off="${esc(statusOff)}" data-status-on="${esc(statusOn)}" data-tip="${esc(tipOff)}" aria-pressed="false" aria-label="${esc(label || `${noun} complete`)}">${completeIcon}</button>`;
}
// Every lesson page, the knowledge checks included, completes on visit. Completion records
// the visit, never a quiz score; the reader can still undo it.
const completionCopy = {
  noun: "Lesson",
  auto: true,
  tipOff: "Mark lesson complete",
  tipOn: "Completed on this browser · select to undo",
  statusOff: "Not completed",
  statusOn: "Completed",
};
// Explicit <!-- lab: name --> markers may only name these standalone labs.
const LAB_NAMES = ["pid", "swerve", "scheduler", "encoder", "motion", "log", "odometry", "mechanism-fixed-shooter", "mechanism-turret-shooter", "mechanism-piece-handling", "mechanism-elevator-wrist", "mechanism-telescoping-arm", "mechanism-drivetrain", "mechanism-climb-balance"];
function readLabs() {
  const labs = new Map();
  for (const name of LAB_NAMES) {
    const file = path.join(docs, "labs", `${name}.html`);
    if (!fs.existsSync(file)) continue;
    const { document } = parseHTML(fs.readFileSync(file, "utf8"));
    labs.set(name, {
      id: `labs/${name}.html`,
      title: document.querySelector("h1")?.textContent.trim() || document.title,
      summary:
        document.querySelector("body > header p")?.textContent.replace(/\s+/g, " ").trim() || "",
    });
  }
  return labs;
}
function readProvenance() {
  const file = path.join(root, "platform/content-provenance.json");
  const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  const list = (key) => {
    const items = Array.isArray(data[key]) ? data[key] : [];
    for (const item of items)
      if (!fs.existsSync(path.join(docs, item)))
        console.warn(`content-provenance.json lists a missing page: ${item}`);
    return new Set(items);
  };
  return { lessons: list("lessons"), labs: list("labs") };
}
const aboutHref = (base, hash) => hrefFor("guides/about-this-course.md", base) + hash;
function provenanceBadge(base, label) {
  return `<a class="provenance-badge" href="${esc(aboutHref(base, "#ai-assisted-lessons"))}">${icon("sparkles")}<span>${esc(label)}</span></a>`;
}
// GitHub-style "> [!NOTE]" blockquotes and the "Historical lesson" banner become callouts.
const CALLOUTS = {
  note: ["Note", "info"],
  tip: ["Tip", "lightbulb"],
  important: ["Important", "message-square-warning"],
  warning: ["Warning", "triangle-alert"],
  caution: ["Caution", "octagon-alert"],
  history: ["Historical lesson", "history"],
};
const CALLOUT_ALIASES = { attention: "warning", danger: "caution", info: "note", hint: "tip" };
function renderCallouts(article, document) {
  for (const quote of [...article.querySelectorAll("blockquote")]) {
    const first = quote.firstElementChild;
    if (!first || first.tagName !== "P") continue;
    const marker = first.innerHTML.match(/^\s*\[!(\w+)\][ \t]*\n?/),
      history = first.innerHTML.match(/^\s*<strong>Historical lesson:?<\/strong>:?\s*/i);
    let kind;
    if (marker) {
      const name = marker[1].toLowerCase();
      kind = CALLOUT_ALIASES[name] || name;
      if (!CALLOUTS[kind]) continue;
      first.innerHTML = first.innerHTML.slice(marker[0].length);
    } else if (history) {
      kind = "history";
      first.innerHTML = first.innerHTML.slice(history[0].length);
    } else continue;
    if (!first.innerHTML.trim()) first.remove();
    const [label, iconName] = CALLOUTS[kind],
      box = document.createElement("div");
    box.setAttribute("class", `callout callout-${kind}`);
    box.setAttribute("role", "note");
    box.innerHTML = `<p class="callout-title">${icon(iconName)}<span>${label}</span></p>${quote.innerHTML}`;
    quote.replaceWith(box);
  }
}
function labEmbed(lab, base, aiAssisted) {
  const href = base + lab.id,
    key = lab.id.replace(/^labs\/|\.html$/g, ""),
    titleId = `lab-${key}-title`;
  const kicker = `Interactive lab${aiAssisted ? " · AI-assisted teaching model" : ""}`;
  return `<div class="lab-embed-head"><span class="lab-embed-icon">${icon("flask-conical")}</span><div class="lab-embed-text"><p class="lab-embed-kicker">${esc(kicker)}</p><p class="lab-embed-title" id="${titleId}">${esc(lab.title)}</p>${lab.summary ? `<p class="lab-embed-summary">${esc(lab.summary)}</p>` : ""}</div><div class="lab-embed-actions">${completionToggle({ source: lab.id, noun: "Lab", tipOff: "Mark lab complete", tipOn: "Lab completed on this browser · select to undo", statusOff: "Not completed", statusOn: "Completed", extraClass: " lab-complete" })}<a class="lab-open" href="${esc(href)}">Open full lab${icon("external-link")}</a></div></div><iframe src="${esc(href)}?embed=1" title="${esc(lab.title)} (interactive)" loading="lazy"></iframe><noscript><p class="lab-embed-noscript">This lab needs JavaScript. <a href="${esc(href)}">Open the full lab page</a> to read its model and experiment.</p></noscript>`;
}
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
// Title for a page without an H1: its sidebar label, else a tidied file or folder name.
function inferredTitle(source, navLabels) {
  if (navLabels.get(source)) return navLabels.get(source);
  const parts = source.split("/"),
    name = parts.at(-1) === "README.md" && parts.length > 1 ? parts.at(-2) : parts.at(-1);
  return (
    name
      .replace(/\.md$/i, "")
      .replace(/^\d+[a-z]?[-_]/i, "")
      .replaceAll("_", " ")
      .trim() || "Lesson"
  );
}
// Every article gets exactly one H1, read from the rendered DOM so code fences never count.
// The author's first H1 is kept; later ones become H2 (content intact, ids assigned later);
// a page with none gets one from inferredTitle.
function ensureSingleH1(article, document, fallback) {
  const [first, ...extra] = article.querySelectorAll("h1");
  for (const h of extra) {
    const h2 = document.createElement("h2");
    for (const attr of [...h.attributes]) h2.setAttribute(attr.name, attr.value);
    h2.innerHTML = h.innerHTML;
    h.replaceWith(h2);
  }
  const found = first?.textContent.replace(/\s+/g, " ").trim();
  if (found) return found;
  if (first) first.textContent = fallback;
  else {
    const h1 = document.createElement("h1");
    h1.textContent = fallback;
    article.prepend(h1);
  }
  return fallback;
}
function renderArticle(md, markdown, source, base, catalog, context) {
  let rendered = md.render(markdown);
  // Generated path links use docs-root paths so the resolver below applies the base.
  if (rendered.includes("<!-- learning-paths -->"))
    rendered = rendered.replace("<!-- learning-paths -->", pathList(catalog));
  if (source === "guides/learning-paths.md")
    rendered = rendered.replace(/<h2[\s>]/, (h2) => pathOverview(catalog, base) + h2);
  // Lab markers become empty placeholders now and full embeds after the search text is taken.
  rendered = rendered.replace(/<!--\s*lab:\s*([\w-]+)\s*-->/g, (_, name) => {
    if (!context.labs.has(name))
      throw new Error(
        `${source}: unknown lab marker "${name}". Use one of: ${LAB_NAMES.join(", ")}.`,
      );
    return `<div data-lab-marker="${name}"></div>`;
  });
  const { document } = parseHTML(
    `<html><body><article>${rendered}</article></body></html>`,
  );
  const article = document.querySelector("article"),
    counts = new Map(),
    toc = [];
  renderCallouts(article, document);
  const title = ensureSingleH1(article, document, inferredTitle(source, context.navLabels));
  // Headings may not take an ID the chrome, the lesson's own HTML, or a lab embed uses.
  const taken = new Set();
  for (const el of article.querySelectorAll("[id]"))
    if (!/^H[123]$/.test(el.tagName)) taken.add(el.id);
  for (const placeholder of article.querySelectorAll("[data-lab-marker]")) {
    const key = context.labs.get(placeholder.getAttribute("data-lab-marker")).id.replace(/^labs\/|\.html$/g, "");
    taken.add(`lab-embed-${key}`).add(`lab-${key}-title`);
  }
  for (const h of article.querySelectorAll("h1,h2,h3")) {
    const name = h.textContent.trim(),
      key = slug(name),
      n = counts.get(key) || 0;
    counts.set(key, n + 1);
    let id = n ? `${key}-${n}` : key;
    if (isChromeId(id) || taken.has(id)) {
      const prefixed = `heading-${id}`;
      id = prefixed;
      for (let i = 2; isChromeId(id) || taken.has(id); i++) id = `${prefixed}-${i}`;
    }
    taken.add(id);
    h.id = id;
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
      `${title}: ${provider} resource ${embedNumber}`,
    );
    iframe.setAttribute("loading", "lazy");
  }
  // Search text and descriptions exclude the controls and embeds added below.
  const text = rawText(document);
  for (const placeholder of [...article.querySelectorAll("[data-lab-marker]")]) {
    const lab = context.labs.get(placeholder.getAttribute("data-lab-marker")),
      section = document.createElement("section");
    section.setAttribute("class", "lab-embed");
    section.setAttribute("id", "lab-embed-" + lab.id.replace(/^labs\/|\.html$/g, ""));
    section.setAttribute("aria-labelledby", `lab-${lab.id.replace(/^labs\/|\.html$/g, "")}-title`);
    section.innerHTML = labEmbed(lab, base, context.provenance.labs.has(lab.id));
    placeholder.replaceWith(section);
  }
  for (const h of article.querySelectorAll("h2[id],h3[id]")) {
    const anchor = document.createElement("a");
    anchor.setAttribute("class", "heading-anchor");
    anchor.setAttribute("href", `#${h.id}`);
    anchor.setAttribute("aria-hidden", "true");
    anchor.setAttribute("tabindex", "-1");
    anchor.textContent = "#";
    h.append(anchor);
  }
  const ai =
      /<!--\s*ai-assisted\s*-->/i.test(markdown) || context.provenance.lessons.has(source),
    meta = lessonMeta(source, base, ai);
  if (meta) {
    const row = document.createElement("div");
    row.setAttribute("class", "lesson-meta");
    row.innerHTML = meta;
    article.querySelector("h1").after(row);
  }
  const summary = [...article.querySelectorAll("p")]
    .filter(p => !p.closest("blockquote, .callout, .lesson-meta, .lab-embed, .home-paths") && !/^(Prerequisites|Status|Time|Historical lesson)[:：]/i.test(p.textContent.trim()))
    .map(p => p.textContent.replace(/\s+/g, " ").trim()).find(t => t.length >= 50) || text.replace(title, "").trim();
  return { html: article.innerHTML, title, text, summary, toc, ai };
}
// Labs keep their own stylesheet. In a lesson iframe (?embed=1) the head script marks
// the document so labs.css hides this bar and the lab header, and the parent's theme wins.
const labBoot = `try{var d=document.documentElement,t,e=new URLSearchParams(location.search).get("embed")==="1"&&window.parent!==window;if(e){try{if(parent.location.origin===location.origin){d.dataset.embed="1";t=parent.document.documentElement.dataset.theme}}catch(x){}}if(t!=="dark"&&t!=="light")t=localStorage.getItem("frc1257-theme");if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.dataset.theme=t}catch(x){}`;
function decorateLab(html, source, base, aiAssisted, outDir) {
  const { document } = parseHTML(html),
    body = document.querySelector("body");
  const meta = pageSeo({source, title: document.querySelector("h1")?.textContent || document.title, summary: document.querySelector("body > header p")?.textContent, base});
  for (const node of document.head.querySelectorAll('title, meta[name="description"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], script[type="application/ld+json"]')) node.remove();
  const head = document.createElement("template"); head.innerHTML = seoHead(meta, base);
  document.head.append(...head.content.childNodes);
  writeSocialCard(meta, outDir);
  body.setAttribute("data-page-id", source);
  body.setAttribute("data-page-title", document.title || "Interactive lab");
  body.setAttribute("data-base", base);
  for (const a of document.querySelectorAll("a[href]")) {
    const raw = a.getAttribute("href");
    if (!/^(?:\.\.\/|\.\/)*#\//.test(raw)) continue;
    const resolved = resolveReference(raw, source, docs, base);
    if (resolved) a.setAttribute("href", resolved);
  }
  const boot = document.createElement("script");
  boot.textContent = labBoot;
  document.head.prepend(boot);
  const toolbar = document.createElement("nav");
  toolbar.setAttribute("class", "course-toolbar");
  toolbar.setAttribute("aria-label", "Course");
  toolbar.innerHTML = `<!-- Icons: ${esc(iconLicense())}, see assets/LICENSE-Lucide.txt --><a class="course-home" href="${esc(base)}"><img src="${esc(base)}media/1257snail.svg" alt="" width="24" height="24"><span>1257 Training</span></a><span class="course-sep" aria-hidden="true">/</span><a href="${esc(hrefFor("labs/README.md", base))}">Course labs</a><span class="course-spacer"></span>${aiAssisted ? `<a class="provenance-badge" href="${esc(aboutHref(base, "#ai-assisted-lessons"))}">${icon("sparkles")}<span>AI-assisted teaching model</span></a>` : ""}<span class="completion">${completionToggle({ id: "complete-lesson", source, auto: true, noun: "Lab", tipOff: "Mark lab complete", tipOn: "Completed on this browser · select to undo", statusOff: "Not completed", statusOn: "Completed" })}<span class="completion-status" aria-hidden="true"></span></span><button id="theme-toggle" class="icon-btn" type="button" aria-label="Dark theme" aria-pressed="false" data-tip="Dark theme">${icon("moon")}${icon("sun")}</button><span id="site-status" class="visually-hidden" role="status" aria-live="polite"></span>`;
  body.prepend(toolbar);
  const script = document.createElement("script");
  script.type = "module";
  script.src = base + "assets/site.mjs";
  body.append(script);
  const guidedStyle = document.createElement("link");
  guidedStyle.rel = "stylesheet";
  guidedStyle.href = base + "labs/guided-labs.css";
  document.head.append(guidedStyle);
  const guided = document.createElement("script");
  guided.type = "module";
  guided.src = base + "labs/guided-labs.mjs";
  body.append(guided);
  return document.toString();
}
function notFound(base, chrome) {
  const link = (source, label) => `<li><a href="${esc(hrefFor(source, base))}">${esc(label)}</a></li>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Team 1257 Robotics Training</title><meta name="robots" content="noindex"><link rel="icon" href="${esc(base)}media/1257snail.svg" type="image/svg+xml">${themeBoot}<link rel="stylesheet" href="${esc(base)}assets/site.css">${noscriptStyle}<script type="module" src="${esc(base)}assets/site.mjs"></script></head><body class="page-404" data-base="${esc(base)}" data-page-id="404" data-page-title="Page not found"><a class="skip-link" href="#main">Skip to content</a>${siteHeader(base, { menu: false })}${chrome.search}<p id="site-status" class="visually-hidden" role="status" aria-live="polite"></p><main id="main" class="lesson not-found"><article><p class="not-found-code">404</p><h1>Page not found</h1><p>This lesson may have moved. Old <code>#/</code> links are redirected automatically when a match exists.</p><p class="not-found-actions"><button class="button-primary" type="button" data-open-search>${icon("search")}<span>Search lessons</span></button> <a class="button" href="${esc(base)}">Go to the home page</a></p><h2>Popular starting points</h2><ul>${link("guides/start-here.md", "Start here")}${link("guides/learning-paths.md", "Learning paths")}${link("labs/README.md", "Interactive labs")}${link("guides/troubleshooting.md", "Troubleshooting")}</ul><noscript><p>Search and automatic legacy link redirects require JavaScript.</p></noscript></article></main>${chrome.footer}</body></html>`;
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
function pathOverview(catalog, base) {
  if (!catalog.paths.length) return "";
  const rows = catalog.paths
    .map(
      (p) =>
        `<tr ${pathHooks(p, "always")}><td><a class="path-link" href="${esc(firstLesson(p))}">${esc(p.title)}</a></td><td>${p.lessons.length}</td><td>${hours(p.estimatedMinutes)}</td><td class="path-status">${pathStatus(p)}<noscript>Needs JavaScript</noscript></td></tr>`,
    )
    .join("");
  return `<h2>Paths at a glance</h2><p class="path-note">Times are approximate self-paced estimates. Each path link opens your next unfinished activity.</p><table class="path-table"><thead><tr><th scope="col">Path</th><th scope="col">Activities</th><th scope="col">Time</th><th scope="col">Progress</th></tr></thead><tbody>${rows}</tbody></table><div class="progress-panel"><p id="progress-summary">Progress is available when JavaScript is enabled.</p>${progressCaveat(base)}${progressTools(true)}</div>`;
}
function progressTools(open = false) {
  return `<details class="progress-tools"${open ? " open" : ""}><summary>Manage progress</summary><div class="progress-tools-body"><p>Progress is saved only in this browser. Export a copy to move it to another device.</p><button id="progress-export" type="button">Export progress</button><label for="progress-import">Import progress</label><input id="progress-import" type="file" accept="application/json,.json"><button id="progress-reset" type="button">Reset progress</button></div></details>`;
}
const progressCaveat = (base) =>
  `<p class="progress-caveat">Opening a lesson marks it complete on this browser. That records a visit, not understanding or a quiz score. Test yourself with the <a href="${esc(hrefFor("guides/knowledge-checks.md", base))}">knowledge checks</a> and labs. <a href="${esc(aboutHref(base, "#progress-on-this-browser"))}">How progress works</a></p>`;
// Section landing pages and the learning-paths hub are not completable lessons.
const isLesson = (source) =>
  source !== "README.md" &&
  !source.endsWith("/README.md") &&
  source !== "guides/learning-paths.md";
// Sits under the H1: the completion toggle and, where relevant, the provenance link.
function lessonMeta(source, base, ai) {
  let html = "";
  if (isLesson(source)) {
    html += `<span class="completion">${completionToggle({ ...completionCopy, id: "complete-lesson", source, extraClass: " tip-start" })}<span class="completion-status" aria-hidden="true"></span></span>`;
  }
  if (ai) html += provenanceBadge(base, "AI-assisted lesson");
  return html;
}
// Footer progress block: the compact next step, summary, caveat and tools.
function lessonProgress(base) {
  return `<section class="lesson-progress" aria-label="Your progress"><p id="next-activity" class="next-activity" hidden></p><div class="lesson-progress-row"><p id="progress-summary">Progress is available when JavaScript is enabled.</p>${progressTools()}</div>${progressCaveat(base)}</section>`;
}
// Runs before first paint so a saved or system dark theme never flashes light.
const themeBoot = `<script>try{var t=localStorage.getItem("frc1257-theme");if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}</script>`;
// Without JS the drawer, toggles and search cannot work, so the tree is shown in place.
const noscriptStyle = `<noscript><style>#search-open,#theme-toggle,#menu-toggle,.completion,.lab-complete,.lesson-progress,[data-open-search],.nav-twisty,.nav-group-toggle svg{display:none!important}.nav-branch>ul[hidden]{display:block}@media (max-width:950px){.sidebar{position:static;transform:none;visibility:visible;width:auto;height:auto;box-shadow:none;border-right:0;border-bottom:1px solid var(--line)}}</style></noscript>`;
function siteHeader(base, { menu = true } = {}) {
  return `<header class="site-header"><!-- Icons: ${esc(iconLicense())}, see assets/LICENSE-Lucide.txt --><a class="site-logo" href="${esc(base)}" aria-label="Team 1257 training home"><img src="${esc(base)}media/1257snail.svg" alt="" width="32" height="32"><span>1257 <strong>Robotics Training</strong></span></a><div class="header-actions"><button id="search-open" class="icon-btn" type="button" aria-haspopup="dialog" aria-label="Search lessons" aria-keyshortcuts="Control+K Meta+K" data-tip="Search (Ctrl/⌘ K)">${icon("search")}</button><button id="theme-toggle" class="icon-btn" type="button" aria-label="Dark theme" aria-pressed="false" data-tip="Dark theme">${icon("moon")}${icon("sun")}</button>${menu ? `<button id="menu-toggle" class="icon-btn" type="button" aria-expanded="false" aria-controls="sidebar" aria-label="Lesson menu" data-tip="Menu">${icon("menu")}${icon("x")}</button>` : ""}</div></header>`;
}
const SECTION_ORDER = [
  ["java", "Java"],
  ["frc", "Robot programming"],
  ["robot-types", "Programming by robot type"],
  ["labs", "Interactive labs"],
  ["foundations", "Robot foundations"],
  ["robots", "Real robots"],
  ["vision", "Vision"],
  ["git", "Git and GitHub"],
  ["guides", "Guides"],
  ["documentation", "Documentation"],
  ["website", "Team website"],
];
const SUGGESTED_SEARCHES = [
  "PID tuning",
  "swerve",
  "encoder units",
  "command scheduler",
  "odometry",
  "arrays",
  "git branch",
  "vision timestamps",
];
// Command-palette markup; platform/search-ui.mjs adds the behavior.
function searchDialog(base, sections) {
  const options = SECTION_ORDER.filter(([key]) => sections.has(key))
    .map(([key, label]) => `<option value="${key}">${esc(label)}</option>`)
    .join("");
  const chips = SUGGESTED_SEARCHES.map(
    (q) => `<li><button class="chip" type="button" data-query="${esc(q)}">${esc(q)}</button></li>`,
  ).join("");
  const topics = [
    ["guides/start-here.md", "Start here"],
    ["java/README.md", "Java"],
    ["frc/README.md", "Robot programming"],
    ["robot-types/README.md", "Robot types"],
    ["labs/README.md", "Interactive labs"],
    ["guides/learning-paths.md", "Learning paths"],
    ["guides/troubleshooting.md", "Troubleshooting"],
  ]
    .filter(([source]) => fs.existsSync(path.join(docs, source)))
    .map(([source, label]) => `<li><a href="${esc(hrefFor(source, base))}">${icon("arrow-right")}<span>${esc(label)}</span></a></li>`)
    .join("");
  return `<dialog id="search-dialog" class="palette" aria-labelledby="search-title"><h2 id="search-title" class="visually-hidden">Search lessons</h2><div class="palette-bar">${icon("search")}<label class="visually-hidden" for="search-input">Search lessons, labs and code</label><input id="search-input" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-results" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" placeholder="Search lessons, labs and code"><span class="palette-spinner" aria-hidden="true"></span><button id="search-clear" class="icon-btn" type="button" aria-label="Clear search" hidden>${icon("x")}</button><button id="search-close" class="palette-close" type="button" aria-label="Close search"><kbd>Esc</kbd>${icon("x")}</button></div><div class="palette-meta"><label for="search-section">Section</label><select id="search-section" aria-label="Search section"><option value="">All sections</option>${options}</select><p id="search-status" role="status" aria-live="polite"></p></div><div class="palette-body"><ul id="search-results" role="listbox" aria-label="Search results"></ul><p class="palette-actions"><button id="search-retry" type="button" hidden>${icon("rotate-ccw")}<span>Try again</span></button><button id="search-widen" type="button" hidden>Search all sections</button></p><div id="search-empty" class="palette-empty"><p class="palette-heading">Suggested searches</p><ul class="chip-list">${chips}</ul><p class="palette-heading">Browse</p><ul class="topic-list">${topics}</ul></div></div><div class="palette-foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>Esc</kbd> close</span><span class="palette-private">Searches never leave this device</span></div></dialog>`;
}
function siteFooter(base) {
  return `<footer class="site-footer"><nav aria-label="Site"><a href="${esc(hrefFor("guides/learning-paths.md", base))}">Learning paths and progress</a><a href="${esc(aboutHref(base, ""))}">About this course</a><a href="https://github.com/FRC1257/robotics-training">Source on GitHub</a><a href="${esc(base)}sitemap.xml">Sitemap</a></nav><p>Team 1257 Robotics Training · Progress and searches stay in this browser; no analytics.</p></footer>`;
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
  chrome,
  seo,
}) {
  const id = source;
  // A rail longer than a dozen entries stops being a summary; skip it.
  const tocHtml =
    toc.length && toc.length <= 12
      ? `<nav aria-label="On this page"><h2>On this page</h2><ul>${toc.map((t) => `<li><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`).join("")}</ul></nav>`
      : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${seoHead(seo, base)}<link rel="icon" href="${esc(base)}media/1257snail.svg" type="image/svg+xml">${themeBoot}<link rel="stylesheet" href="${esc(base)}assets/katex.min.css"><link rel="stylesheet" href="${esc(base)}assets/site.css">${noscriptStyle}<script type="module" src="${esc(base)}assets/site.mjs"></script></head><body data-page-id="${esc(id)}" data-page-title="${esc(title)}" data-base="${esc(base)}"><a class="skip-link" href="#main">Skip to content</a><noscript><p class="noscript-note">Lessons and navigation are available without JavaScript. Search, progress, legacy link redirects, and interactive labs require JavaScript.</p></noscript>${siteHeader(base)}${chrome.search}<progress id="reading-progress" value="0" max="100" aria-label="Reading progress"></progress><p id="site-status" class="visually-hidden" role="status" aria-live="polite"></p><div class="site-layout"><aside id="sidebar" class="sidebar">${sidebar(tree, source)}</aside><main id="main" class="lesson"><article>${html}</article><footer class="lesson-footer">${isLesson(source) ? lessonProgress(base) : ""}<nav class="lesson-pager" aria-label="Lesson progression">${prev ? `<a rel="prev" href="${esc(prev.href)}"><small>Previous</small><span>${esc(prev.label)}</span></a>` : ""}${next ? `<a rel="next" href="${esc(next.href)}"><small>Next</small><span>${esc(next.label)}</span></a>` : ""}</nav><p class="lesson-source"><a href="https://github.com/FRC1257/robotics-training/edit/main/docs/${source.split("/").map(encodeURIComponent).join("/")}">Edit this lesson</a> · <a href="https://raw.githubusercontent.com/FRC1257/robotics-training/main/docs/${source.split("/").map(encodeURIComponent).join("/")}">View source</a></p></footer></main><aside class="toc">${tocHtml}</aside></div>${chrome.footer}</body></html>`;
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
    context = {
      labs: readLabs(),
      provenance: readProvenance(),
      // First sidebar label per page; it names pages whose Markdown has no H1.
      navLabels: new Map(
        [...entries].reverse().filter((e) => e.source).map((e) => [e.source, e.label]),
      ),
    },
    sections = new Set([
      "labs",
      ...sources.filter((s) => s.includes("/")).map((s) => s.split("/")[0]),
    ]),
    chrome = { search: searchDialog(base, sections), footer: siteFooter(base) },
    titles = {},
    routeMap = {},
    search = [],
    urls = [];
  for (const source of sources) {
    const markdown = fs.readFileSync(path.join(docs, source), "utf8"),
      article = renderArticle(md, markdown, source, base, catalog, context),
      title = article.title,
      seo = pageSeo({source, title, summary: article.summary, base}),
      description = seo.description,
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
        chrome,
        seo,
      }),
    );
    writeSocialCard(seo, outDir);
    titles[source] = title;
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
        decorateLab(
          fs.readFileSync(path.join(docs, file), "utf8"),
          file,
          base,
          context.provenance.labs.has(file),
          outDir,
        ),
      );
    else fs.copyFileSync(path.join(docs, file), dest);
  }
  for (const source of walk(docs).filter(
    (p) => p.startsWith("labs/") && p.endsWith(".html"),
  )) {
    const document = parseHTML(
      fs.readFileSync(path.join(docs, source), "utf8"),
    ).document;
    urls.push(pageSeo({source, title: document.title, base}).canonical);
    const title = document.querySelector("h1")?.textContent || source;
    titles[source] = title;
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
  // Small id → title map so the footer can name the next activity without the search index.
  fs.writeFileSync(
    path.join(assetDir, "lesson-titles.json"),
    JSON.stringify(titles),
  );
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
  fs.writeFileSync(path.join(outDir, "404.html"), notFound(base, chrome));
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
