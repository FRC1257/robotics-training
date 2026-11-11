import { test, expect } from "@playwright/test";
async function capture(page, options) {
  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  await page.screenshot(options);
}
function watch(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.url().startsWith("http://127.0.0.1:4173/") && r.status() >= 400)
      errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}
test("home, legacy navigation, search and local progress work", async ({
  page,
}, testInfo) => {
  const errors = watch(page);
  await page.goto("/");
  await expect(page.locator("main h1")).toHaveText(
    "Team 1257 Robotics Training",
  );
  await expect(page.locator("[data-path-id]")).toHaveCount(4);
  await expect(page.locator("#search-open svg")).toBeVisible();
  await expect(page.locator("#search-open")).toHaveText("");
  await expect(page.locator(".top-nav")).toHaveCount(0);
  await expect(page.locator("#complete-lesson")).toHaveCount(0);
  if (testInfo.project.name === "mobile")
    await page.locator("#menu-toggle").click();
  const javaBranch = page.getByRole("button", {
    name: "Java pages",
    exact: true,
  });
  await expect(javaBranch).toHaveAttribute("aria-expanded", "false");
  await javaBranch.click();
  await expect(javaBranch).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.locator('.sidebar a[href="/java/1-Basics/index.html"]'),
  ).toBeVisible();
  await javaBranch.click();
  if (testInfo.project.name === "mobile") {
    await page.keyboard.press("Escape");
    await expect(page.locator("#menu-toggle")).toBeFocused();
  }
  await capture(page, {
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
  await page.locator("#search-open").click();
  await page.locator("#search-input").fill("swevre");
  await expect(page.locator("#search-results li").first()).toBeVisible();
  await expect(page.locator("#search-results")).toContainText(/swerve/i);
  await page.getByLabel("Search section").selectOption("labs");
  await expect(page.locator("#search-results")).toContainText(
    "Swerve kinematics lab",
  );
  await page.locator("#search-close").click();
  await page.goto("/#/guides/start-here");
  await expect(page).toHaveURL(/guides\/start-here.html/);
  await expect(page.locator("article h1")).toContainText("first weeks");
  const complete = page.locator("#complete-lesson");
  await complete.click();
  await expect(complete).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(complete).toHaveAttribute("aria-pressed", "true");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#theme-toggle svg")).toHaveCount(2);
  await capture(page, {
    path: testInfo.outputPath("lesson-dark.png"),
    fullPage: true,
  });
  if (testInfo.project.name === "mobile") {
    await page.locator("#menu-toggle").click();
    await expect(page.locator("#menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(page.locator("#sidebar")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("hardware lesson shows sourced diagrams and actual component photographs", async ({
  page,
}, testInfo) => {
  const errors = watch(page);
  await page.goto("/foundations/system.html");
  const images = page.locator("article img");
  await expect(images).toHaveCount(6);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((el) => el.complete && el.naturalWidth > 0))
      .toBeTruthy();
  }
  await expect(page.locator("article")).toContainText(
    "Team 3161 and Stefen Acepcion",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
  await capture(page, {
    path: testInfo.outputPath("hardware.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("knowledge checks explain answers and progress import validates data", async ({
  page,
}, testInfo) => {
  const errors = watch(page);
  await page.goto("/guides/knowledge-checks.html");
  await expect(page.locator("#quiz-body input[type=radio]")).toHaveCount(4);
  await page.locator('#quiz-body input[value="1"]').check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator("#quiz-status")).toContainText("Correct.");
  await page
    .getByRole("button", { name: "Next question", exact: true })
    .click();
  await expect(page.locator("#quiz-body legend")).toContainText(
    "DoubleSupplier",
  );
  await capture(page, {
    path: testInfo.outputPath("knowledge-check.png"),
    fullPage: true,
  });
  await page.locator(".progress-tools summary").click();
  await page.locator("#progress-import").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":2,"completed":{}}'),
  });
  await expect(page.locator("#site-status")).toContainText(
    "Could not import progress",
  );
  await page.locator("#progress-import").setInputFiles({
    name: "progress.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      '{"version":1,"completed":{"guides/knowledge-checks.md":"2026-11-10T12:00:00Z"}}',
    ),
  });
  await expect(page.locator("#complete-lesson")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(errors).toEqual([]);
});
for (const lab of [
  "pid",
  "swerve",
  "scheduler",
  "encoder",
  "motion",
  "log",
  "odometry",
])
  test(`${lab} lab runs, marks progress and fits viewport`, async ({
    page,
  }, testInfo) => {
    const errors = watch(page);
    await page.goto(`/labs/${lab}.html`);
    await expect(page.locator("h1")).toBeVisible();
    if (lab === "pid") {
      await page.locator("#step").click();
      await expect(page.locator("#summary")).toContainText("Time");
      await expect(page.locator("#sample-table tr").first()).toBeVisible();
    }
    if (lab === "swerve") {
      await page.locator("#preset").selectOption("rotation");
      await expect(page.locator("#states tr")).toHaveCount(4);
      await expect(page.locator("#omega")).not.toHaveValue("0");
    }
    if (lab === "log") {
      await expect(page.locator("#status")).toContainText(
        "29 independent samples",
      );
      await expect(page.locator("#rows tr")).toHaveCount(29);
    }
    await page.locator("#complete-lesson").click();
    await expect(page.locator("#complete-lesson")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBeTruthy();
    await capture(page, {
      path: testInfo.outputPath(`${lab}.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
test.describe("reading without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("lesson text and source navigation are available", async ({ page }) => {
    await page.goto("/guides/start-here.html");
    await expect(page.locator("article h1")).toContainText("first weeks");
    await expect(page.locator("article a").first()).toBeVisible();
  });
});
