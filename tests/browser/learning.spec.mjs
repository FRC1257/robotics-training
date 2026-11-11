import { test, expect } from '@playwright/test';
test('home and learning navigation render',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/#/');
  await expect(page.locator('.markdown-section h1')).toContainText('Learn to program');
  await page.screenshot({path:testInfo.outputPath('home.png'),fullPage:true});
  await page.goto('/#/guides/start-here');
  await expect(page.locator('.markdown-section h1')).toContainText('first weeks');
  expect(errors).toEqual([]);
});
for(const lab of ['pid','swerve','scheduler','encoder','motion','log','odometry'])test(`${lab} lab loads without errors`,async({page},testInfo)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`/labs/${lab}.html`);
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBeTruthy();
  await page.screenshot({path:testInfo.outputPath(`${lab}.png`),fullPage:true});
});
