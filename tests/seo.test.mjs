import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseHTML } from "linkedom";
import {
  summarize,
  pageSeo,
  seoHead,
  siteOrigin,
} from "../scripts/site-seo.mjs";

test("SEO descriptions stop at word boundaries and curated entries refer to real pages", () => {
  const text =
    "A useful introduction to robot programming and repeated practice. ".repeat(
      5,
    );
  const out = summarize(text);
  assert.ok(out.length <= 160);
  assert.ok(text.includes(out.slice(0, -1)));
  assert.ok(out.endsWith("…"));
  for (const [source, meta] of Object.entries(
    JSON.parse(fs.readFileSync("platform/seo.json")),
  )) {
    assert.ok(fs.existsSync("docs/" + source), source);
    assert.ok(meta.description.length <= 160, source);
  }
});
test("social and structured metadata safely preserve literal titles and custom paths", () => {
  const meta = pageSeo({
    source: "java/example.md",
    title: 'A </script> & "title"',
    summary:
      "A useful description explaining a real robotics programming concept for learners.",
    base: "/course/",
  });
  const html = seoHead(meta, "/course/");
  const d = parseHTML(
    "<html><head>" + html + "</head><body></body></html>",
  ).document;
  assert.equal(d.querySelectorAll("script").length, 1);
  assert.equal(d.title, 'A </script> & "title" | 1257 Robotics Training');
  const graph = JSON.parse(d.querySelector("script").textContent)["@graph"];
  assert.equal(graph[2].name, meta.shortTitle);
  assert.equal(graph[2].isAccessibleForFree, true);
  assert.equal(
    d.querySelector('meta[property="og:url"]').getAttribute("content"),
    "https://frc1257.github.io/course/java/example.html",
  );
  assert.ok(!html.includes("SearchAction"));
  const root = pageSeo({
    source: "labs/pid.html",
    title: "PID lab",
    base: "/",
  });
  assert.equal(root.canonical, "https://frc1257.github.io/labs/pid.html");
});
test("deployment origin rejects credentials and paths", (t) => {
  const previous = process.env.SITE_ORIGIN;
  t.after(() => {
    if (previous === undefined) delete process.env.SITE_ORIGIN;
    else process.env.SITE_ORIGIN = previous;
  });
  for (const value of [
    "https://example.org/path",
    "https://user:secret@example.org",
    "file:///tmp/site",
  ]) {
    process.env.SITE_ORIGIN = value;
    assert.throws(() => siteOrigin());
  }
  process.env.SITE_ORIGIN = "https://training.example.org/";
  assert.equal(siteOrigin(), "https://training.example.org");
});
