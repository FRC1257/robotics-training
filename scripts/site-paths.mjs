import path from "node:path";
import fs from "node:fs";
const posix = path.posix;
export function normalizeBase(value = "/robotics-training/") {
  let s = String(value).trim();
  if (!s.startsWith("/")) s = "/" + s;
  if (!s.endsWith("/")) s += "/";
  if (s.includes("..") || /[?#\\]/.test(s))
    throw Error(
      "SITE_BASE must be an absolute URL path without query, hash, or traversal",
    );
  return s.replace(/\/{2,}/g, "/");
}
export function outputPath(source) {
  if (source === "README.md") return "index.html";
  if (source.endsWith("/README.md")) return source.slice(0, -9) + "index.html";
  return source.replace(/\.md$/i, ".html");
}
export function hrefFor(source, base = "/robotics-training/") {
  const out = outputPath(source);
  return normalizeBase(base) + out.split("/").map(encodeURIComponent).join("/");
}
export function legacyRoutes(source) {
  const routes = new Set();
  const bare = source.replace(/\.md$/i, "");
  routes.add("/" + bare);
  routes.add("/" + source);
  if (source === "README.md") {
    routes.add("/");
    routes.add("/README");
  } else if (source.endsWith("/README.md")) {
    const dir = source.slice(0, -10);
    routes.add("/" + dir);
    routes.add("/" + dir + "/");
  }
  return [...routes];
}
// Resolve Markdown links relative to source directory, with root fallback for old Docsify links.
export function resolveReference(
  raw,
  source,
  docsRoot,
  base = "/robotics-training/",
) {
  if (!raw) return raw;
  // Legacy absolute links and standalone lab backlinks share Docsify hash routes.
  const absolute = raw.match(
    /^https?:\/\/frc1257\.github\.io\/robotics-training\/(#\/.*)$/i,
  );
  const relative = raw.match(/^(?:\.\.\/|\.\/)*(#\/.*)$/);
  const legacy = (absolute || relative)?.[1];
  if (
    !legacy &&
    (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(raw) || raw.startsWith("#"))
  )
    return raw;
  let text = legacy ? legacy.slice(1) : raw;
  const match = text.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  if (!match) return raw;
  let [_, pathname, query = "", hash = ""] = match;
  if (legacy && query) {
    const id = new URLSearchParams(query.slice(1)).get("id");
    query = "";
    if (id) hash = "#" + encodeURIComponent(id);
  }
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  let choices = pathname.startsWith("/")
    ? [pathname.slice(1)]
    : [
        posix.normalize(posix.join(posix.dirname(source), pathname)),
        posix.normalize(pathname),
      ];
  for (let choice of choices) {
    choice = choice.replace(/^\.\//, "");
    if (choice === ".." || choice.startsWith("../")) continue;
    const candidates = [choice];
    if (!choice || choice.endsWith("/"))
      candidates.unshift(choice + "README.md");
    else if (!posix.extname(choice))
      candidates.push(choice + ".md", choice + "/README.md");
    for (const item of candidates) {
      const absolute = path.join(docsRoot, item);
      if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) continue;
      if (item.endsWith(".md")) return hrefFor(item, base) + query + hash;
      return (
        normalizeBase(base) +
        item.split("/").map(encodeURIComponent).join("/") +
        query +
        hash
      );
    }
  }
  return null;
}
