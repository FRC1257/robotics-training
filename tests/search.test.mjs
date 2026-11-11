import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  searchLessons,
  tokenize,
  buildSearchIndex,
} from "../platform/search.mjs";
const specs = [
  [
    "frc/1-Basics/Modern_Drivetrain_Project.md",
    "Project: swerve, localization and autonomous",
    "frc",
  ],
  ["frc/2-Sensors_And_Shuffleboard/3-Encoders.md", "Encoders", "frc"],
  [
    "frc/2-Sensors_And_Shuffleboard/8-Zeroing_Sensors.md",
    "Homing and zeroing sensors",
    "frc",
  ],
  [
    "frc/3-Closed_Loop_Control/2-Basics_of_PID.md",
    "PID: correct the error",
    "frc",
  ],
  [
    "frc/3-Closed_Loop_Control/4-Feedforward.md",
    "Feedforward: predict the effort",
    "frc",
  ],
  ["vision/PhotonVision/Code.md", "PhotonVision pose integration", "vision"],
  ["guides/troubleshooting.md", "Debug with evidence", "guides"],
  ["frc/1-Basics/2a-Motors.md", "Motors", "frc"],
  ["java/Textbook_Practice.md", "Java practice: predict, run, explain", "java"],
  ["java/1-Basics/6-Arrays.md", "Arrays", "java"],
];
const pages = specs.map(([id, title, section]) => ({
  id,
  title,
  section,
  href: "/" + id.replace(/\.md$/, ".html"),
  text: fs.readFileSync(new URL("../docs/" + id, import.meta.url), "utf8"),
}));
test("identifier tokenization preserves acronym and word boundaries", () => {
  assert.deepEqual(tokenize("PIDController CANSparkMax ArrayList"), [
    "pid",
    "controller",
    "can",
    "spark",
    "max",
    "array",
    "list",
  ]);
});
test("transposed spelling finds relevant lessons and marks fuzzy results", () => {
  for (const [query, id] of [
    ["swevre", "Modern_Drivetrain_Project"],
    ["encdoer", "3-Encoders"],
  ]) {
    const results = searchLessons(pages, query);
    assert.ok(
      results.some((r) => r.id.includes(id) && r.fuzzyUsed),
      query,
    );
    assert.ok(results[0].snippet);
    assert.deepEqual(results[0].matchedTerms, [query]);
  }
});
test("natural language and FRC synonyms find relevant modern lessons", () => {
  for (const [query, id] of [
    ["how do i tune pid", "2-Basics_of_PID"],
    ["robot not moving", "troubleshooting"],
    ["pose estimation", "PhotonVision"],
    ["feed forward", "4-Feedforward"],
    ["CANSparkMax", "Motors"],
    ["ArrayList", "Textbook_Practice"],
  ]) {
    const hits = searchLessons(pages, query, 10);
    assert.ok(
      hits.some((r) => r.id.includes(id)),
      `${query}: ${hits.map((h) => h.id)}`,
    );
  }
});
test("field weighting, phrase match, archive demotion and section filter", () => {
  const index = [
    {
      id: "frc/new.md",
      title: "PID tuning",
      section: "frc",
      href: "/new",
      text: "PID tuning helps.",
    },
    {
      id: "frc/archive/old.md",
      title: "PID tuning",
      section: "frc",
      href: "/old",
      text: "Historical lesson: PID tuning helps.",
    },
    {
      id: "java/other.md",
      title: "Other",
      section: "java",
      href: "/other",
      text: "pid tuning appears here.",
    },
  ];
  assert.equal(searchLessons(index, "PID tuning")[0].id, "frc/new.md");
  assert.deepEqual(
    searchLessons(index, "PID tuning", 20, { section: "java" }).map(
      (x) => x.id,
    ),
    ["java/other.md"],
  );
  assert.equal(buildSearchIndex(index), buildSearchIndex(index));
});
test("unusual input is bounded, safe, and does not invent matches", () => {
  assert.deepEqual(searchLessons(pages, "<script> !@#$%^&*"), []);
  assert.deepEqual(searchLessons(pages, "how do i"), []);
  assert.deepEqual(searchLessons(pages, "swevre", 0), []);
  assert.doesNotThrow(() => searchLessons(pages, "x".repeat(10000), 10));
  assert.deepEqual(searchLessons([], null), []);
});
