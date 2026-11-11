import test from "node:test";
import assert from "node:assert/strict";
import {
  validateProgress,
  readProgress,
  toggleCompletion,
  pathProgress,
  searchLessons,
  legacyDestination,
} from "../platform/learning.mjs";
test("progress toggles persistable dates and computes unique path completion", () => {
  const a = toggleCompletion(
    { version: 1, completed: {} },
    "java/README.md",
    new Date("2026-11-10T12:00:00Z"),
  );
  assert.equal(a.completed["java/README.md"], "2026-11-10T12:00:00.000Z");
  assert.deepEqual(
    pathProgress(
      ["java/README.md", "java/README.md", "frc/README.md"],
      a.completed,
    ),
    { done: 1, total: 2, percent: 50 },
  );
  assert.equal(
    Object.keys(toggleCompletion(a, "java/README.md").completed).length,
    0,
  );
});
test("progress rejects malformed imports and prototype keys", () => {
  for (const data of [
    {},
    { version: 2, completed: {} },
    { version: 1, completed: [] },
    { version: 1, completed: { a: "not a date" } },
    JSON.parse(
      '{"version":1,"completed":{"__proto__":"2026-11-10T00:00:00Z"}}',
    ),
  ])
    assert.throws(() => validateProgress(data));
});
test("unavailable or corrupted storage does not break learning", () => {
  assert.equal(
    readProgress({
      getItem() {
        throw Error();
      },
    }).available,
    false,
  );
  assert.equal(
    readProgress({
      getItem() {
        return "{bad";
      },
    }).available,
    false,
  );
  assert.equal(
    readProgress({
      getItem() {
        return null;
      },
    }).available,
    true,
  );
});
test("search ranks titles, combines terms and finds domain synonyms", () => {
  const pages = [
    {
      id: "a",
      href: "/a.html",
      title: "PID controls",
      text: "tuning controllers",
    },
    {
      id: "b",
      href: "/b.html",
      title: "Other",
      text: "proportional integral derivative controls",
    },
    { id: "c", href: "/c.html", title: "Sensors", text: "cameras" },
  ];
  assert.equal(searchLessons(pages, "PID")[0].id, "a");
  assert.equal(searchLessons(pages, "PID controls").length, 2);
  assert.equal(searchLessons(pages, "notfound").length, 0);
  assert.equal(searchLessons(pages, "[").length, 0);
  assert.equal(searchLessons(pages, "").length, 0);
});
test("legacy routes preserve headings without accepting external redirects", () => {
  const map = { "/a": "/robotics-training/a.html", "/bad": "//outside.test" };
  assert.equal(
    legacyDestination(map, "#/a?id=one-two"),
    "/robotics-training/a.html#one-two",
  );
  assert.equal(legacyDestination(map, "#/missing"), null);
  assert.equal(legacyDestination(map, "#/bad"), null);
  assert.equal(legacyDestination(map, "#normal-anchor"), null);
});
