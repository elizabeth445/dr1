import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
  test(`layout and screenshots at ${width}px`, async ({ page }) => {
    await mkdir('output/qa', { recursive: true });
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.goto('/');
    await page.screenshot({ path: `output/qa/opening-${width}.png` });
    expect(
      await page.locator('.opening').evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    ).toBe(true);
    await page.getByRole('button', { name: 'Пропустити вступ' }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `output/qa/hero-${width}.png` });
    for (const id of ['invitation', 'moments', 'details', 'evening', 'wish', 'rsvp']) {
      await page
        .locator(`#${id}`)
        .evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `output/qa/${id}-${width}.png` });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `overflow at ${id}`,
      ).toBe(true);
    }
    await page
      .locator('.closing')
      .evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.screenshot({ path: `output/qa/closing-${width}.png` });
    await page.screenshot({ path: `output/qa/full-${width}.png`, fullPage: true });
    const clipped = await page.locator('h1,h2,h3').evaluateAll((els) =>
      els
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width > 0 &&
            (el.scrollWidth > el.clientWidth + 2 || r.left < 0 || r.right > innerWidth + 1)
          );
        })
        .map((el) => el.textContent),
    );
    expect(clipped).toEqual([]);
  });
}
test('short landscape invitation keeps skip and open controls reachable', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Пропустити вступ' })).toBeInViewport();
  await page.getByRole('button', { name: 'Відкрити запрошення', exact: true }).click();
  await expect(page.locator('.opening')).not.toBeVisible();
});

test('hero lines survive resizing across the animation breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Пропустити вступ' }).click();
  await page.waitForTimeout(1200);
  for (const width of [390, 1024, 320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(300);
    const rows = await page.locator('.hero-line').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect(),
          mask = el.closest('.line-mask')!.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, maskTop: mask.top, maskBottom: mask.bottom };
      }),
    );
    for (const r of rows) {
      expect(r.top).toBeGreaterThanOrEqual(r.maskTop - 5);
      expect(r.bottom).toBeLessThanOrEqual(r.maskBottom + 5);
    }
  }
});
