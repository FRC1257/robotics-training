import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const { demos } = JSON.parse(
  readFileSync("docs/labs/mechanism-sources.json", "utf8"),
);
const ids = Object.keys(demos);
function watch(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (
      response.url().startsWith("http://127.0.0.1:4173/") &&
      response.status() >= 400
    )
      errors.push(`${response.status()} ${response.url()}`);
  });
  return errors;
}
async function ready(page) {
  await expect(page.locator("#mech")).toHaveAttribute("data-ready", "1");
  await expect(page.locator("#mech-code .ln").first()).toBeAttached();
}
const state = (page) => page.evaluate(() => window.mechanismDemo.state());
const step = (page, count = 1) =>
  page.evaluate((n) => window.mechanismDemo.step(n), count);
for (const id of ids) {
  test(`${id} controls, source, motion, faults and dark view work`, async ({
    page,
  }, testInfo) => {
    const errors = watch(page);
    await page.goto(`/labs/mechanism-${id}.html`);
    await ready(page);
    await expect(page.locator("#mech-code .ln")).toHaveCount(
      demos[id].endLine - demos[id].startLine + 1,
    );
    await expect(page.locator("#mech-source")).toContainText(demos[id].team);
    await expect(page.locator("#mech-source")).toContainText(
      "The Java is not executed",
    );
    const sourceLink = page
      .locator("#mech-source a")
      .filter({ hasText: "Pinned source" });
    await expect(sourceLink).toHaveAttribute("href", demos[id].url);
    expect(
      await page
        .locator(
          "#mech-svg circle, #mech-svg path, #mech-svg line, #mech-svg rect",
        )
        .count(),
    ).toBeGreaterThan(25);
    await expect(page.locator("#mech-runstate")).toContainText("Paused");
    await page.locator("#mech-step").click();
    expect((await state(page)).time).toBeCloseTo(0.02, 5);
    await page.locator('[data-scenario="ready"]').click();
    if (id === "climb-balance") await page.locator("#in-cageDetected").check();
    const initialSvg = await page.locator("#mech-svg").innerHTML();
    await step(page, 80);
    expect(await page.locator("#mech-svg").innerHTML()).not.toBe(initialSvg);
    await expect(page.locator("#mech-code .is-hl").first()).toBeAttached();
    const transforms = (selector) =>
      page
        .locator(selector)
        .evaluate((svg) =>
          [...svg.querySelectorAll("[transform]")].map((el) =>
            el.getAttribute("transform"),
          ),
        );
    expect(await transforms("#mech-code-svg")).toEqual(
      await transforms("#mech-svg"),
    );
    const duplicates = await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    });
    expect(duplicates).toEqual([]);
    const lastPoint = await page
      .locator("#mech-plot polyline")
      .first()
      .getAttribute("points");
    expect(
      Number(lastPoint.trim().split(" ").at(-1).split(",")[0]),
    ).toBeCloseTo(472, 1);
    await expect(page.locator("#mech-sensors th").first()).not.toHaveText("");
    await expect(page.locator("#mech-sensors td").first()).not.toHaveText("");
    await page.locator(".mech-stage").screenshot({
      path: testInfo.outputPath("mechanism-light.png"),
      animations: "disabled",
    });
    await page.locator("#theme-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.locator(".mech-stage").screenshot({
      path: testInfo.outputPath("mechanism-dark.png"),
      animations: "disabled",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if (id === "fixed-shooter" || id === "telescoping-arm") {
      await page.locator(".mech-trace-grid").screenshot({
        path: testInfo.outputPath("mechanism-with-code.png"),
        animations: "disabled",
      });
    }
    await page.locator("#in-stale").check();
    await step(page);
    expect((await state(page)).fault).toBe(true);
    expect(
      Object.values((await state(page)).outputs).every((value) => value === 0),
    ).toBe(true);
    await page.locator("#in-stale").uncheck();
    await step(page);
    expect((await state(page)).fault).toBe(true);
    await page.locator("#in-request").click();
    await page.locator("#pulse-reset").click();
    expect((await state(page)).fault).toBe(false);
    expect(errors).toEqual([]);
  });
  test(`${id} embeds inside its lesson and follows theme`, async ({ page }) => {
    const errors = watch(page);
    await page.goto(`/robot-types/${id}.html`);
    const selector = `iframe[src*="/labs/mechanism-${id}.html?embed=1"]`;
    const iframe = page.locator(selector);
    await expect(iframe).toHaveCount(1);
    await iframe.scrollIntoViewIfNeeded();
    const frame = page.frameLocator(selector);
    await expect(frame.locator("#mech")).toHaveAttribute("data-ready", "1");
    await expect(frame.locator("#mech-code .ln").first()).toBeAttached();
    await expect(frame.locator("html")).toHaveAttribute("data-embed", "1");
    await frame.locator('[data-scenario="ready"]').click();
    if (id === "climb-balance") await frame.locator("#in-cageDetected").check();
    await frame.locator("#mech-step").click();
    await page.locator("#theme-toggle").click();
    await expect(frame.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(
      await frame
        .locator("body")
        .evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    ).toBe(true);
    await expect
      .poll(async () => {
        const outer = await iframe.evaluate(
          (el) => el.getBoundingClientRect().height,
        );
        const inner = await frame
          .locator("body")
          .evaluate((el) => el.getBoundingClientRect().height);
        return Math.abs(outer - inner);
      })
      .toBeLessThan(6);
    await expect(
      frame.locator("#mech-source a").filter({ hasText: "Pinned source" }),
    ).toHaveAttribute("target", "_top");
    expect(errors).toEqual([]);
  });
}

test("mechanism Run/Pause advances and preserves model time", async ({
  page,
}) => {
  await page.goto("/labs/mechanism-drivetrain.html");
  await ready(page);
  await page.locator('[data-scenario="ready"]').click();
  await page.locator("#mech-run").click();
  await expect.poll(async () => (await state(page)).time).toBeGreaterThan(0.1);
  await page.locator("#mech-run").click();
  const paused = (await state(page)).time;
  await page.locator("#theme-toggle").click();
  expect((await state(page)).time).toBe(paused);
});

test("turret travel and differential mode are adjustable through actual controls", async ({
  page,
}) => {
  await page.goto("/labs/mechanism-turret-shooter.html");
  await ready(page);
  await page.locator('[data-scenario="ready"]').click();
  await page.locator('[data-scenario="unreachable"]').click();
  await step(page);
  expect((await state(page)).phase).toBe("unreachable");
  await page.locator('[data-scenario="equivalent"]').click();
  await step(page, 50);
  expect((await state(page)).angle).toBeCloseTo(0.5, 4);
  await page.goto("/labs/mechanism-drivetrain.html");
  await ready(page);
  await page.locator('[data-scenario="ready"]').click();
  await page.locator('[data-scenario="strafe"]').click();
  await page.locator("#in-differential").check();
  await step(page, 10);
  expect((await state(page)).outputs.vyMps).toBe(0);
  await page.locator("#in-differential").uncheck();
  await step(page);
  expect((await state(page)).outputs.vyMps).toBe(1.5);
});

test("paused controls remain pending until the next code step", async ({
  page,
}) => {
  await page.goto("/labs/mechanism-piece-handling.html");
  await ready(page);
  await page.locator('[data-scenario="ready"]').click();
  await step(page);
  const before = (await state(page)).time;
  await page.locator("#in-stale").check();
  await expect(page.locator("#mech-pending")).toBeVisible();
  expect((await state(page)).time).toBe(before);
  expect((await state(page)).fault).toBe(false);
  await page.locator("#mech-code-step").click();
  expect((await state(page)).fault).toBe(true);
  await expect(page.locator("#mech-pending")).toBeHidden();
});
