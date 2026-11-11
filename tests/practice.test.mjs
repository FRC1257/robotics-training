import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { gradeAnswer, courseHref } from "../platform/practice.mjs";
const { questions } = JSON.parse(
  readFileSync("platform/knowledge-checks.json", "utf8"),
);
test("knowledge checks have unique identifiers, valid answers and real prerequisite lessons", () => {
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  assert.ok(questions.length >= 10);
  for (const q of questions) {
    assert.ok(q.choices.length >= 3);
    assert.ok(q.explanation.length > 30);
    assert.ok(
      Number.isInteger(q.answer) &&
        q.answer < q.choices.length &&
        q.answer >= 0,
    );
    assert.ok(existsSync("docs/" + q.lesson));
    assert.equal(gradeAnswer(q, q.answer).correct, true);
    assert.equal(
      gradeAnswer(q, (q.answer + 1) % q.choices.length).correct,
      false,
    );
  }
  assert.throws(() => gradeAnswer(questions[0], -1));
});
test("recommendation paths preserve project base and encode special directory names", () => {
  assert.equal(
    courseHref("java/README.md", "/course/"),
    "/course/java/index.html",
  );
  assert.equal(
    courseHref("frc/5-Advanced_&_Misc/Sysid.md", "/course/"),
    "/course/frc/5-Advanced_%26_Misc/Sysid.html",
  );
  assert.equal(
    courseHref("labs/pid.html", "/course/"),
    "/course/labs/pid.html",
  );
});
