import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseHTML } from "linkedom";
import { buildSite } from "../scripts/build-site.mjs";
import {
  normalizeBase,
  outputPath,
  hrefFor,
  legacyRoutes,
  resolveReference,
} from "../scripts/site-paths.mjs";
const root = path.resolve("."),
  docs = path.join(root, "docs");
test("source path routing and project base are stable", () => {
  assert.equal(normalizeBase("course"), "/course/");
  assert.throws(() => normalizeBase("/../bad"));
  assert.equal(outputPath("java/README.md"), "java/index.html");
  assert.equal(
    outputPath("website/1-Site_Layout.md/README.md"),
    "website/1-Site_Layout.md/index.html",
  );
  assert.equal(
    hrefFor("java/1-Basics/1-First_Program.md"),
    "/robotics-training/java/1-Basics/1-First_Program.html",
  );
  assert.ok(legacyRoutes("java/README.md").includes("/java/"));
  assert.equal(
    resolveReference(
      "../../labs/pid.html",
      "frc/3-Closed_Loop_Control/2-Basics_of_PID.md",
      docs,
      "/course/",
    ),
    "/course/labs/pid.html",
  );
  assert.equal(
    resolveReference("labs/pid.html", "labs/README.md", docs, "/course/"),
    "/course/labs/pid.html",
  );
  assert.equal(resolveReference("#example", "README.md", docs), "#example");
  assert.equal(
    resolveReference(
      "https://frc1257.github.io/robotics-training/#/website/2-Annual_Updates/1-Student_Leadership?id=more-on-formatting",
      "README.md",
      docs,
      "/course/",
    ),
    "/course/website/2-Annual_Updates/1-Student_Leadership.html#more-on-formatting",
  );
  assert.equal(
    resolveReference("../#/robots/2024-log", "labs/log.html", docs, "/course/"),
    "/course/robots/2024-log.html",
  );
  assert.equal(
    resolveReference("https://example.org", "README.md", docs),
    "https://example.org",
  );
  assert.equal(resolveReference("../nonexistent.md", "README.md", docs), null);
});
test("build emits semantic pages, legacy routes, search, math and copied assets", (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "robot-site-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const output = path.join(temp, "site");
  const result = buildSite({ base: "/course/", outDir: output });
  assert.ok(result.count > 100);
  const read = (p) => fs.readFileSync(path.join(output, p), "utf8");
  const home = parseHTML(read("index.html")).document;
  assert.ok(home.querySelector("header.site-header"));
  assert.equal(home.querySelectorAll("h1").length, 1);
  assert.ok(home.querySelector("main#main article"));
  assert.ok(home.querySelector("dialog#search-dialog #search-input"));
  assert.equal(home.querySelector("button#complete-lesson[data-lesson]"), null);
  assert.equal(
    home.querySelector("body").getAttribute("data-base"),
    "/course/",
  );
  assert.ok(
    home
      .querySelector("link[rel=canonical]")
      .getAttribute("href")
      .endsWith("/course/index.html"),
  );
  assert.ok(
    home.querySelector(
      '[data-path-id="newcomer-java"][data-path-lessons] progress',
    ),
  );
  assert.equal(home.querySelector("#progress-import"), null);
  assert.ok(
    parseHTML(read("guides/learning-paths.html")).document.querySelector(
      "#progress-import",
    ),
  );
  assert.ok(home.querySelector("#search-open svg[aria-hidden]"));
  assert.ok(home.querySelector("#theme-toggle svg[aria-hidden]"));
  assert.ok(home.querySelector(".sidebar ul ul"));
  assert.equal(home.querySelector(".top-nav"), null);
  assert.ok(home.querySelector("#site-status"));
  assert.equal(
    home.querySelector("body").getAttribute("data-page-id"),
    "README.md",
  );
  const pid = parseHTML(
    read("frc/3-Closed_Loop_Control/2-Basics_of_PID.html"),
  ).document;
  assert.equal(
    pid.querySelector('article a[href="/course/labs/pid.html"]').textContent,
    "PID lab",
  );
  assert.ok(
    pid.querySelector(
      'iframe[src="/course/labs/pid.html?embed=1"][title][loading="lazy"]',
    ),
  );
  assert.ok(
    pid.querySelector('.lesson-meta #complete-lesson[data-auto="visit"] svg'),
  );
  assert.ok(pid.querySelector(".lesson-footer .progress-tools"));
  assert.match(
    pid.querySelector(".lesson-meta").textContent,
    /AI-assisted lesson/,
  );
  assert.ok(pid.querySelector("aside.sidebar a[aria-current=page]"));
  assert.ok(pid.querySelector("link[rel=canonical]"));
  const math = read("frc/3-Closed_Loop_Control/5-Motion_Profiling.html");
  assert.match(math, /class="katex/);
  assert.match(math, /language-/);
  const lab = parseHTML(read("labs/pid.html")).document;
  assert.equal(lab.body.dataset.pageId, "labs/pid.html");
  assert.ok(lab.querySelector('#complete-lesson[data-lesson="labs/pid.html"]'));
  assert.equal(
    lab.querySelector("header a").getAttribute("href"),
    "/course/labs/index.html",
  );
  assert.ok(lab.querySelector('script[src="/course/assets/site.mjs"]'));
  assert.ok(fs.existsSync(path.join(output, "assets/site.css")));
  assert.ok(fs.existsSync(path.join(output, "assets/learning.mjs")));
  assert.ok(fs.existsSync(path.join(output, "assets/LICENSE-KaTeX.txt")));
  assert.ok(fs.existsSync(path.join(output, "assets/LICENSE-Prism.txt")));
  assert.ok(!fs.existsSync(path.join(output, "vendor")));
  assert.ok(read("404.html").includes('id="search-dialog"'));
  assert.match(read("robots.txt"), /host root/);
  assert.ok(
    fs.existsSync(path.join(output, "assets/fonts/KaTeX_Main-Regular.woff2")),
  );
  const map = JSON.parse(read("route-map.json"));
  assert.equal(map["/java/"], "/course/java/index.html");
  assert.equal(map["/java/README.md"], "/course/java/index.html");
  const index = JSON.parse(read("search-index.json"));
  assert.ok(
    index.some(
      (x) => x.title.includes("PID") && x.href.startsWith("/course/") && x.text,
    ),
  );
  assert.match(read("sitemap.xml"), /\/course\/java\/index\.html/);
  const walk = (dir) =>
    fs
      .readdirSync(dir, { withFileTypes: true })
      .flatMap((d) =>
        d.isDirectory()
          ? walk(path.join(dir, d.name))
          : [path.join(dir, d.name)],
      );
  const missing = [];
  for (const file of walk(output).filter((f) => f.endsWith(".html"))) {
    const doc = parseHTML(fs.readFileSync(file, "utf8")).document;
    const article = doc.querySelector("main.lesson > article");
    if (article) {
      assert.equal(
        article.querySelectorAll("h1").length,
        1,
        `${file}: exactly one visible page title`,
      );
      for (const quote of article.querySelectorAll("blockquote"))
        assert.doesNotMatch(
          quote.textContent,
          /\[!(NOTE|TIP|WARNING|ATTENTION|IMPORTANT|CAUTION)\]/,
          `${file}: callout rendered`,
        );
    }
    const ids = [...doc.querySelectorAll("[id]")].map((el) => el.id);
    assert.equal(
      ids.length,
      new Set(ids).size,
      `${file}: unique element identifiers`,
    );
    for (const el of doc.querySelectorAll("[href],[src]")) {
      const raw = el.getAttribute("href") ?? el.getAttribute("src");
      if (!raw || raw.startsWith("#") || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(raw))
        continue;
      const url = new URL(
        raw,
        "https://example.test/course/" +
          path.relative(output, file).split(path.sep).join("/"),
      );
      if (!url.pathname.startsWith("/course/")) {
        missing.push(`${path.relative(output, file)} -> ${raw} (outside base)`);
        continue;
      }
      const dest = path.join(
        output,
        decodeURIComponent(url.pathname.slice("/course/".length)),
      );
      if (!fs.existsSync(dest))
        missing.push(`${path.relative(output, file)} -> ${raw}`);
    }
  }
  assert.deepEqual(missing, []);
});
test("root deployment does not introduce a double slash", (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "robot-root-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  buildSite({ base: "/", outDir: temp });
  const html = fs.readFileSync(path.join(temp, "index.html"), "utf8");
  assert.match(html, /href="\/assets\/site.css"/);
  assert.doesNotMatch(html, /href="\/\/assets/);
});
