import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { DEMO_IDS } from "../docs/labs/mechanism-models.mjs";
const { demos } = JSON.parse(
  readFileSync("docs/labs/mechanism-sources.json", "utf8"),
);
const { sources } = JSON.parse(
  readFileSync("research_sources/mechanism-code.json", "utf8"),
);
test("every mechanism has a pinned licensed source excerpt and an intact receipt", () => {
  assert.deepEqual(Object.keys(demos).sort(), [...DEMO_IDS].sort());
  for (const id of DEMO_IDS) {
    const code = demos[id];
    const receipt = sources.find((entry) => entry.slug === id);
    assert.ok(receipt, id);
    assert.match(code.revision, /^[a-f0-9]{40}$/);
    assert.ok(
      code.url.includes(
        `/blob/${code.revision}/${code.file}#L${code.startLine}-L${code.endLine}`,
      ),
    );
    assert.equal(code.license, "MIT");
    const licensePath = `docs/${code.licenseFile}`;
    assert.ok(existsSync(licensePath));
    assert.match(
      readFileSync(licensePath, "utf8"),
      /Permission is hereby granted/,
    );
    assert.equal(
      createHash("sha256").update(code.excerpt).digest("hex"),
      receipt.excerpt_sha256,
    );
    assert.equal(code.revision, receipt.revision);
    assert.equal(code.file, receipt.file);
    assert.deepEqual([code.startLine, code.endLine], receipt.lines);
    const lines = code.excerpt.split("\n");
    if (lines.at(-1) === "") lines.pop();
    assert.equal(lines.length, code.endLine - code.startLine + 1);
    assert.ok(lines.length >= 10 && lines.length <= 25);
  }
});
test("source annotations stay within the excerpt and disclose teaching-model differences", () => {
  for (const [id, code] of Object.entries(demos)) {
    assert.ok(code.explanation.length > 50, id);
    assert.ok(code.differences.length > 0, id);
    assert.equal(
      new Set(code.trace.map((trace) => trace.id)).size,
      code.trace.length,
    );
    for (const trace of code.trace) {
      assert.ok(trace.explanation.length > 20);
      assert.ok(trace.sourceLines.length > 0);
      for (const line of trace.sourceLines)
        assert.ok(
          Number.isInteger(line) &&
            line >= code.startLine &&
            line <= code.endLine,
          `${id}: line ${line}`,
        );
    }
  }
});
