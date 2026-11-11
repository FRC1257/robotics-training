import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { Resvg } from "@resvg/resvg-js";
import { hrefFor } from "./site-paths.mjs";

export const SITE_NAME = "Team 1257 Robotics Training";
const root = path.resolve(import.meta.dirname, "..");
// Card URLs change when the renderer, bundled fonts or logo change, so preview caches
// cannot retain an old design under an otherwise identical page title.
const cardRevision = createHash("sha256");
for (const file of [
  new URL(import.meta.url),
  path.join(root, "scripts/fonts/Inter-Regular.ttf"),
  path.join(root, "scripts/fonts/Inter-Bold.ttf"),
  path.join(root, "docs/media/1257snail.svg"),
])
  cardRevision.update(fs.readFileSync(file));
const cardFingerprint = cardRevision.digest("hex");
const overrides = JSON.parse(
  fs.readFileSync(path.join(root, "platform/seo.json"), "utf8"),
);
const sections = {
  java: "Java programming",
  frc: "FRC robot programming",
  foundations: "Robot foundations",
  "robot-types": "Programming by robot type",
  robots: "Real robot code and logs",
  labs: "Interactive robotics labs",
  guides: "Learning guides",
  git: "Git and GitHub",
  vision: "Robot vision",
  documentation: "Documentation",
  website: "Team website",
};
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function siteOrigin() {
  const url = new URL(process.env.SITE_ORIGIN || "https://frc1257.github.io");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw Error(
      "SITE_ORIGIN must be an HTTP(S) origin without a path or credentials",
    );
  return url.origin;
}
export function summarize(text, limit = 160) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= limit) return clean;
  const cut = clean
    .slice(0, limit - 1)
    .replace(/\s+\S*$/, "")
    .replace(/[,:;\-–—]+$/, "")
    .trim();
  return cut + "…";
}
export function pageSeo({ source, title, summary, base }) {
  const home = source === "README.md";
  const section = sections[source.split("/")[0]] || "Team 1257 training";
  const shortTitle =
    overrides[source]?.title || title.replace(/\s+/g, " ").trim();
  const description =
    overrides[source]?.description ||
    summarize(summary) ||
    `Learn ${shortTitle} with Team 1257's free FRC programming lessons and practical examples.`;
  const cardTitle = home ? "Program your first competition robot." : shortTitle;
  const imageId = createHash("sha256")
    .update(JSON.stringify([cardFingerprint, cardTitle, description, section]))
    .digest("hex")
    .slice(0, 16);
  return {
    source,
    home,
    section,
    shortTitle,
    title: home ? shortTitle : `${shortTitle} | 1257 Robotics Training`,
    description,
    cardTitle,
    canonical: siteOrigin() + hrefFor(source, base),
    imagePath: `media/og/${imageId}.png`,
    imageAlt: `${shortTitle} — ${SITE_NAME}`,
    collection: source.endsWith("README.md"),
  };
}
export function seoHead(meta, base) {
  const homeUrl = siteOrigin() + base + "index.html";
  const image = siteOrigin() + base + meta.imagePath;
  const orgId = homeUrl + "#organization",
    siteId = homeUrl + "#website";
  const graph = [
    {
      "@type": "Organization",
      "@id": orgId,
      name: "FIRST Robotics Competition Team 1257",
      url: "https://frc1257.org/",
    },
    {
      "@type": "WebSite",
      "@id": siteId,
      url: homeUrl,
      name: SITE_NAME,
      inLanguage: "en",
      publisher: { "@id": orgId },
    },
    {
      "@type": meta.collection
        ? "CollectionPage"
        : ["WebPage", "LearningResource"],
      "@id": meta.canonical + "#page",
      url: meta.canonical,
      name: meta.shortTitle,
      description: meta.description,
      inLanguage: "en",
      isPartOf: { "@id": siteId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: image,
        width: 1200,
        height: 630,
      },
      ...(meta.collection
        ? {}
        : {
            learningResourceType: meta.source.endsWith(".html")
              ? "Interactive lab"
              : "Lesson",
            isAccessibleForFree: true,
          }),
    },
  ];
  if (!meta.home) {
    const crumbs = [{ name: "Home", item: homeUrl }];
    const dir = path.posix.dirname(meta.source);
    const parent = dir + "/README.md";
    if (
      dir !== "." &&
      parent !== meta.source &&
      fs.existsSync(path.join(root, "docs", parent))
    )
      crumbs.push({
        name: meta.section,
        item: siteOrigin() + hrefFor(parent, base),
      });
    crumbs.push({ name: meta.shortTitle, item: meta.canonical });
    graph.push({
      "@type": "BreadcrumbList",
      "@id": meta.canonical + "#breadcrumbs",
      itemListElement: crumbs.map((x, i) => ({
        "@type": "ListItem",
        position: i + 1,
        ...x,
      })),
    });
    graph[2].breadcrumb = { "@id": meta.canonical + "#breadcrumbs" };
  }
  return `<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${esc(meta.canonical)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#141119">
<meta property="og:type" content="${meta.collection ? "website" : "article"}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${esc(meta.canonical)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta property="og:image:alt" content="${esc(meta.imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(meta.title)}">
<meta name="twitter:description" content="${esc(meta.description)}">
<meta name="twitter:image" content="${esc(image)}">
<meta name="twitter:image:alt" content="${esc(meta.imageAlt)}">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
}
const pngCache = new Map();
function wrap(text, max = 36) {
  const rows = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > max) {
      rows.push(line);
      line = "";
    }
    line += (line ? " " : "") + word;
  }
  if (line) rows.push(line);
  return rows;
}
export function writeSocialCard(meta, outDir) {
  if (!pngCache.has(meta.imagePath)) {
    const lines = wrap(meta.cardTitle, 35);
    const size = lines.length > 4 ? 42 : lines.length > 3 ? 52 : 64;
    const rows = wrap(meta.cardTitle, size === 42 ? 46 : size === 52 ? 39 : 31);
    const summaryRows = wrap(
      meta.home
        ? "Free Java and WPILib lessons, interactive demos, and real competition robot code."
        : meta.description,
      85,
    ).slice(0, 3);
    const logo = fs
      .readFileSync(path.join(root, "docs/media/1257snail.svg"))
      .toString("base64");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#141119"/><path d="M0 0H1200V8H0Z" fill="#b9a1ed"/><image href="data:image/svg+xml;base64,${logo}" x="64" y="43" width="62" height="58"/><text x="146" y="80" font-family="Inter" font-size="27" font-weight="600" fill="#f7f4fc">1257 Robotics Training</text><text x="64" y="153" font-family="Inter" font-size="20" fill="#b9a1ed">${esc(meta.home ? "FREE FRC PROGRAMMING HANDBOOK" : meta.section.toUpperCase())}</text><text font-family="Inter" font-weight="700" font-size="${size}" fill="#f7f4fc">${rows
      .slice(0, 5)
      .map(
        (t, i) => `<tspan x="60" y="${225 + i * (size + 9)}">${esc(t)}</tspan>`,
      )
      .join(
        "",
      )}</text><text font-family="Inter" font-size="23" fill="#bdb6c8">${summaryRows.map((t, i) => `<tspan x="64" y="${Math.max(422, 240 + rows.length * (size + 9)) + i * 32}">${esc(t)}</tspan>`).join("")}</text><path d="M64 536H1136" stroke="#383140"/><text x="64" y="582" font-family="Inter" font-size="21" fill="#e5dfed">Java · WPILib · Interactive labs · Real robot code</text><path d="m1095 565 18 10-18 10m-22-10h39" fill="none" stroke="#b9a1ed" stroke-width="3"/></svg>`;
    const png = new Resvg(svg, {
      font: {
        fontFiles: [
          path.join(root, "scripts/fonts/Inter-Regular.ttf"),
          path.join(root, "scripts/fonts/Inter-Bold.ttf"),
        ],
        loadSystemFonts: false,
        defaultFontFamily: "Inter",
      },
    })
      .render()
      .asPng();
    pngCache.set(meta.imagePath, png);
  }
  const dest = path.join(outDir, meta.imagePath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, pngCache.get(meta.imagePath));
}
