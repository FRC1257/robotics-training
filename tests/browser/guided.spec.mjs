import { test, expect } from "@playwright/test";
import { GUIDES } from "../../docs/labs/guided-labs.mjs";
for (const [id, guide] of Object.entries(GUIDES)) {
  test(`${id} guided steps stay simple and preserve Explore`, async ({
    page,
  }, testInfo) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/labs/${guide.mechanism ? "mechanism-" : ""}${id}.html`);
    await expect(page.locator("body")).toHaveAttribute(
      "data-lab-mode",
      "guided",
    );
    await expect(page.locator("#lab-guide-prev")).toBeDisabled();
    const visibleButtons = () =>
      page
        .locator("main button")
        .evaluateAll(
          (nodes) =>
            nodes.filter(
              (n) =>
                n.getClientRects().length &&
                getComputedStyle(n).display !== "none",
            ).length,
        );
    expect(await visibleButtons()).toBeLessThanOrEqual(3);
    await expect(page.locator("#theme-toggle")).toBeVisible();
    for (let i = 0; i < guide.stages.length; i++) {
      await expect(page.locator("body")).toHaveAttribute(
        "data-guide-step",
        String(i + 1),
      );
      await expect(page.locator("#lab-guide h3")).toHaveText(
        guide.stages[i].title,
      );
      expect(await visibleButtons()).toBeLessThanOrEqual(3);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      if (i === Math.min(2, guide.stages.length - 1)) {
        await page
          .locator("main")
          .screenshot({
            path: testInfo.outputPath(`${id}-guided.png`),
            animations: "disabled",
          });
      }
      if (i < guide.stages.length - 1) {
        await page.locator("#lab-guide-next").focus();
        await page.keyboard.press("Enter");
      }
    }
    await expect(page.locator("#lab-guide-next")).toBeDisabled();
    let before;
    if (guide.mechanism) {
      before = await page.evaluate(() =>
        JSON.stringify(window.mechanismDemo.state()),
      );
      await page.waitForTimeout(150);
      expect(
        await page.evaluate(() => JSON.stringify(window.mechanismDemo.state())),
      ).toBe(before);
    }
    await page.locator("#lab-guide-explore").click();
    await expect(page.locator("body")).toHaveAttribute(
      "data-lab-mode",
      "explore",
    );
    if (guide.mechanism) {
      expect(
        await page.evaluate(() => JSON.stringify(window.mechanismDemo.state())),
      ).toBe(before);
      await expect(page.locator("#mech-run")).toBeVisible();
      await expect(page.locator("#mech-source")).toBeVisible();
    } else {
      expect(await visibleButtons()).toBeGreaterThanOrEqual(2);
    }
    await page.locator("#lab-guide-return").click();
    await expect(page.locator("body")).toHaveAttribute(
      "data-lab-mode",
      "guided",
    );
    await expect(page.locator("body")).toHaveAttribute(
      "data-guide-step",
      String(guide.stages.length),
    );
    await page.locator("#lab-guide-prev").click();
    await expect(page.locator("body")).toHaveAttribute(
      "data-guide-step",
      String(guide.stages.length - 1),
    );
    expect(errors).toEqual([]);
  });
}
test("guided mode works in a lesson with reduced motion and theme changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/vision/3-Pose_Fusion.html");
  const iframe = page.locator('iframe[src*="/labs/odometry.html?embed=1"]');
  await iframe.scrollIntoViewIfNeeded();
  const frame = page.frameLocator('iframe[src*="/labs/odometry.html?embed=1"]');
  await expect(frame.locator("body")).toHaveAttribute(
    "data-lab-mode",
    "guided",
  );
  await frame.locator("#lab-guide-next").click();
  await page.locator("#theme-toggle").click();
  await expect(frame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(frame.locator("body")).toHaveAttribute("data-guide-step", "2");
  await frame.locator("#lab-guide-explore").click();
  await expect(frame.locator("#drift")).toBeVisible();
});
