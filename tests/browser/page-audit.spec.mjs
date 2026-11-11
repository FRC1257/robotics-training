import { test, expect } from "@playwright/test";

const pages = [
  "java/1-Basics/2-Variables.html",
  "java/1-Basics/6-Arrays.html",
  "java/1-Basics/programs/Variables.html",
  "website/2-Annual_Updates/1-Student_Leadership.html",
  "frc/2-Sensors_And_Shuffleboard/5-Boolean_Sensors.html",
  "frc/3-Closed_Loop_Control/4-Feedforward.html",
  "frc/4-Autonomous/3c-Following_Trajectories.html",
  "robots/2026-code.html",
  "guides/learning-paths.html",
  "robot-types/index.html",
  "robot-types/turret-shooter.html",
  "robot-types/elevator-wrist.html",
  ...[
    "1-IO_Interfaces",
    "2-Simulation_IO",
    "3-Logging_Replay",
    "4-Interpolation_Tables",
    "5-Integration_Project",
    "6-Timing_And_State",
    "7-Filtering_And_Validity",
  ].map((name) => `frc/6-Architecture/${name}.html`),
];
for (const route of pages) {
  test(`page audit ${route}`, async ({ page }, testInfo) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`/${route}`);
    expect(response.status()).toBe(200);
    await expect(page.locator("article h1")).toHaveCount(1);
    await expect(page.locator("article h1")).toBeVisible();
    await expect(page.locator("article")).not.toContainText(
      /\[!(?:NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/,
    );
    const completion = page.locator("#complete-lesson");
    if (await completion.count()) {
      await expect(completion).toHaveAttribute("aria-pressed", "true");
      await expect(completion.locator("svg").first()).toBeVisible();
      expect((await completion.innerText()).trim()).toBe("");
    }
    if (route.includes("6-Architecture"))
      await expect(page.locator("main")).toContainText("AI-assisted");
    const fits = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      );
    expect(await fits()).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("light.png"),
      animations: "disabled",
    });
    await page.locator("#theme-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const background = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).not.toBe("rgb(17, 30, 26)");
    expect(await fits()).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("dark.png"),
      animations: "disabled",
    });
    expect(errors).toEqual([]);
  });
}
