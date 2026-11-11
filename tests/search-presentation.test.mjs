import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import {
  breadcrumb,
  wordMatcher,
  highlightInto,
} from "../platform/search-ui.mjs";

test("search breadcrumbs explain a result without leaking filenames", () => {
  assert.deepEqual(
    breadcrumb({ id: "frc/6-Architecture/4-Interpolation_Tables.md" }),
    ["Robot programming", "Architecture"],
  );
  assert.deepEqual(breadcrumb({ id: "java/1-Basics/README.md" }), ["Java"]);
  assert.deepEqual(breadcrumb({ id: "README.md" }), ["Home"]);
});
test("search highlights useful words and close spellings", () => {
  const match = wordMatcher("how do I tune swevre");
  assert.equal(match("swerve"), true);
  assert.equal(match("how"), false);
  assert.equal(match("battery"), false);
});
test("search result highlighting preserves literal content as text", () => {
  const { document } = parseHTML("<html><body><p></p></body></html>");
  const target = document.querySelector("p");
  const text = '<img src=x onerror="alert(1)"> PID & feedforward';
  highlightInto(target, text, wordMatcher("PID"));
  assert.equal(target.textContent, text);
  assert.equal(target.querySelector("img"), null);
  assert.equal(target.querySelector("mark").textContent, "PID");
});
