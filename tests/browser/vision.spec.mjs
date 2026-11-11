import { test, expect } from "@playwright/test";
test("AprilTag walkthrough connects pixels, placement and capture time", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/labs/vision.html");
  await expect(page.locator("body")).toHaveAttribute("data-vision-step", "1");
  await expect(page.locator("#vision-back")).toBeDisabled();
  await expect(page.locator("#vision-view image")).toBeVisible();
  await expect(page.locator("#vision-view .corner")).toHaveCount(0);
  await page.locator("#vision-next").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#vision-view .corner")).toHaveCount(4);
  await expect(page.locator("#vision-result")).toContainText("41.25 px");
  await page
    .locator("main")
    .screenshot({ path: testInfo.outputPath("vision-corners.png") });
  await page.locator("#vision-next").click();
  await expect(page.locator("#vision-result")).toContainText("(2.40, 2.20)");
  await page.locator("#vision-next").click();
  await expect(page.locator("#vision-result")).toContainText(
    "robot (2.00, 2.00)",
  );
  await page.locator("#vision-next").click();
  await expect(page.locator("#camera-mount")).toBeVisible();
  await expect(page.locator("#camera-latency")).toBeHidden();
  await expect(page.locator("#vision-result")).toContainText("error 0.60 m");
  await page.locator("#fix-mount").check();
  await expect(page.locator("#vision-result")).toContainText("error 0.00 m");
  await page.locator("#fix-mount").uncheck();
  await page.locator("#camera-mount").evaluate((el) => {
    el.value = "0.8";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#vision-result")).toContainText("error 0.40 m");
  await page
    .locator("main")
    .screenshot({ path: testInfo.outputPath("vision-placement.png") });
  await page.locator("#vision-next").click();
  await expect(page.locator("#vision-result")).toContainText("error 0.40 m");
  await expect(page.locator("#placement-controls")).toBeHidden();
  await page.locator("#camera-latency").evaluate((el) => {
    el.value = "300";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#vision-result")).toContainText("error 0.60 m");
  await page.locator("#vision-next").click();
  await expect(page.locator("#vision-result")).toContainText("error 0.00 m");
  await page.locator("#use-capture").uncheck();
  await expect(page.locator("#vision-result")).toContainText("error 0.60 m");
  await page.locator("#use-capture").check();
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .locator("main")
    .screenshot({ path: testInfo.outputPath("vision-latency-dark.png") });
  await expect(page.locator("#vision-next")).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect(await page.locator("main button").count()).toBe(2);
  expect(errors).toEqual([]);
});
test("vision demo embeds without inner scrolling and remains usable with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/vision/2-Geometry_And_Calibration.html");
  const iframe = page.locator('iframe[src*="/labs/vision.html?embed=1"]');
  await iframe.scrollIntoViewIfNeeded();
  const frame = page.frameLocator('iframe[src*="/labs/vision.html?embed=1"]');
  await expect(frame.locator("body")).toHaveAttribute("data-vision-step", "1");
  await frame.locator("#vision-next").click();
  await expect(frame.locator("#vision-view .corner")).toHaveCount(4);
  await page.locator("#theme-toggle").click();
  await expect(frame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(async () =>
      Math.abs(
        (await iframe.evaluate((e) => e.getBoundingClientRect().height)) -
          (await frame
            .locator("body")
            .evaluate((e) => e.getBoundingClientRect().height)),
      ),
    )
    .toBeLessThan(6);
  expect(
    await frame
      .locator("body")
      .evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  ).toBe(true);
});
