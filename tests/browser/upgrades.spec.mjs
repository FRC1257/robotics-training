import { test, expect } from "@playwright/test";

test("search palette supports suggestions, highlights, keyboard navigation and recovery", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.locator("#theme-toggle").click();
  await page.locator("#search-open").click();
  await expect(page.locator("#search-empty")).toBeVisible();
  await page.locator("#search-input").fill("interpolation");
  const options = page.locator('#search-results [role="option"]');
  await expect(options.first()).toContainText(/interpolation/i);
  await expect(options.first().locator("mark").first()).toBeVisible();
  const input = page.locator("#search-input");
  const firstId = await options.first().getAttribute("id");
  await expect(input).toHaveAttribute("aria-activedescendant", firstId);
  await input.press("ArrowDown");
  await expect(input).not.toHaveAttribute("aria-activedescendant", firstId);
  await input.press("ArrowUp");
  await expect(input).toHaveAttribute("aria-activedescendant", firstId);
  await page.screenshot({
    path: testInfo.outputPath("search-dark.png"),
    animations: "disabled",
  });
  await page.locator("#search-clear").click();
  await expect(input).toHaveValue("");
  await expect(page.locator("#search-empty")).toBeVisible();
  await input.fill("zzzzqxvnonexistent");
  await expect(page.locator("#search-status")).toContainText("No results");
  await input.press("Escape");
  await expect(page.locator("#search-dialog")).not.toBeVisible();
  await expect(page.locator("#search-open")).toBeFocused();
  await page.keyboard.press("Control+k");
  await input.fill("interpolation");
  await expect(options.first()).toBeVisible();
  const destination = await options.first().locator("a").getAttribute("href");
  await input.press("Enter");
  await expect(page).toHaveURL(
    new URL(destination, "http://127.0.0.1:4173").href,
  );
});

test("a failed search index can be retried", async ({ page }) => {
  await page.route("**/search-index.json", (route) => route.abort());
  await page.goto("/");
  await page.locator("#search-open").click();
  await page.locator("#search-input").fill("swerve");
  await expect(page.locator("#search-retry")).toBeVisible();
  await expect(page.locator("#search-status")).toContainText("couldn't load");
  await page.unroute("**/search-index.json");
  await page.locator("#search-retry").click();
  await expect(page.locator("#search-results li").first()).toBeVisible();
});

test("visiting a lesson records one stable completion date with an icon by its heading", async ({
  page,
}) => {
  const key = "frc1257-learning-v1";
  const id = "java/1-Basics/2-Variables.md";
  await page.goto("/java/1-Basics/2-Variables.html");
  await expect(page.locator("#complete-lesson")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const date = await page.evaluate(
    ({ key, id }) => JSON.parse(localStorage.getItem(key)).completed[id],
    { key, id },
  );
  expect(Number.isFinite(Date.parse(date))).toBe(true);
  const buttonY = await page
    .locator("#complete-lesson")
    .evaluate((el) => el.getBoundingClientRect().top);
  expect(buttonY).toBeLessThan(330);
  await page.reload();
  await expect(page.locator("#complete-lesson")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    await page.evaluate(
      ({ key, id }) => JSON.parse(localStorage.getItem(key)).completed[id],
      { key, id },
    ),
  ).toBe(date);
  await expect(page.locator(".lesson-footer .progress-tools")).toHaveCount(1);
  await expect(page.locator("article .progress-tools")).toHaveCount(0);
});

test("embedded PID runs in the lesson, follows theme and does not complete merely on iframe load", async ({
  page,
}, testInfo) => {
  await page.goto("/frc/3-Closed_Loop_Control/2-Basics_of_PID.html");
  const frameElement = page.locator('iframe[src*="/labs/pid.html?embed=1"]');
  await expect(frameElement).toHaveCount(1);
  await frameElement.scrollIntoViewIfNeeded();
  const frame = page.frameLocator('iframe[src*="/labs/pid.html?embed=1"]');
  await expect(frame.locator("html")).toHaveAttribute("data-embed", "1");
  await expect(page.locator("#lab-embed-pid")).toHaveAttribute(
    "data-sized",
    "",
  );
  expect(
    await page.evaluate(() =>
      Object.hasOwn(
        JSON.parse(localStorage.getItem("frc1257-learning-v1")).completed,
        "labs/pid.html",
      ),
    ),
  ).toBe(false);
  await frame.locator("#lab-guide-explore").click();
  await frame.locator("#step").click();
  await expect(frame.locator("#summary")).toContainText("Time");
  const pausedSummary = await frame.locator("#summary").innerText();
  await page.locator("#theme-toggle").click();
  await expect(frame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(frame.locator("#summary")).toHaveText(pausedSummary);
  const plotBackground = await frame
    .locator("#plot")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(
    Math.max(...plotBackground.match(/\d+/g).slice(0, 3).map(Number)),
  ).toBeLessThan(40);
  const presetWidth = await frame
    .locator("#preset")
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(presetWidth).toBeGreaterThan(180);
  const height = await frameElement.evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  const contentHeight = await frame
    .locator("body")
    .evaluate((el) => el.getBoundingClientRect().height);
  expect(Math.abs(height - contentHeight)).toBeLessThan(6);
  await page
    .locator("#lab-embed-pid .lab-embed-head")
    .evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.screenshot({
    path: testInfo.outputPath("embedded-pid-dark.png"),
    animations: "disabled",
  });
  const labToggle = page.locator("#lab-embed-pid [data-complete-toggle]");
  await labToggle.click();
  await expect(labToggle).toHaveAttribute("aria-pressed", "true");
});

for (const [name, lesson] of [
  ["scheduler", "frc/1-Basics/5c-Making_Commands.html"],
  ["encoder", "frc/2-Sensors_And_Shuffleboard/3-Encoders.html"],
  ["motion", "frc/3-Closed_Loop_Control/5-Motion_Profiling.html"],
  ["swerve", "frc/1-Basics/Modern_Drivetrain_Project.html"],
  ["odometry", "frc/1-Basics/Modern_Drivetrain_Project.html"],
  ["log", "robots/2024-log.html"],
]) {
  test(`embedded ${name} fits the page and receives its theme`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/${lesson}`);
    const selector = `iframe[src*="/labs/${name}.html?embed=1"]`;
    const frameElement = page.locator(selector);
    await frameElement.scrollIntoViewIfNeeded();
    const frame = page.frameLocator(selector);
    await expect(frame.locator("html")).toHaveAttribute("data-embed", "1");
    await expect(page.locator(`#lab-embed-${name}`)).toHaveAttribute(
      "data-sized",
      "",
    );
    await page.locator("#theme-toggle").click();
    await expect(frame.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(
      await frame
        .locator("body")
        .evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    ).toBe(true);
    await expect
      .poll(async () => {
        const height = await frameElement.evaluate(
          (el) => el.getBoundingClientRect().height,
        );
        const content = await frame
          .locator("body")
          .evaluate((el) => el.getBoundingClientRect().height);
        return Math.abs(height - content);
      })
      .toBeLessThan(6);
    if (name === "log") await expect(frame.locator("#rows tr")).toHaveCount(29);
    expect(errors).toEqual([]);
  });
}
