import { test, expect } from "@playwright/test";

test("social previews load real PNGs and metadata is available without JavaScript", async ({
  browser,
  page,
}, testInfo) => {
  for (const route of [
    "/",
    "/labs/pid.html",
    "/robot-types/turret-shooter.html",
  ]) {
    await page.goto(route);
    const image = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    const imagePath = new URL(image).pathname;
    // Production metadata uses its configured public origin. Load the same path
    // from the test server, so this checks the exact artifact before deployment.
    const dimensions = await page.evaluate(async (path) => {
      const img = new Image();
      img.src = path;
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    }, imagePath);
    expect(dimensions).toEqual([1200, 630]);
    await expect(page.locator("head title")).toHaveCount(1);
    expect(
      await page.locator('meta[name="twitter:card"]').getAttribute("content"),
    ).toBe("summary_large_image");
  }
  await page.goto("/");
  const image = new URL(
    await page.locator('meta[property="og:image"]').getAttribute("content"),
  ).pathname;
  await page.goto(image);
  await page
    .locator("img")
    .screenshot({ path: testInfo.outputPath("homepage-social-card.png") });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const plain = await context.newPage();
    await plain.goto("/");
    await expect(plain.locator("h1")).toHaveText("Team 1257 Robotics Training");
    await expect(plain.locator('meta[property="og:image"]')).toHaveCount(1);
    const schema = JSON.parse(
      await plain.locator('script[type="application/ld+json"]').textContent(),
    );
    expect(schema["@graph"].some((node) => node["@type"] === "WebSite")).toBe(
      true,
    );
  } finally {
    await context.close();
  }
});
