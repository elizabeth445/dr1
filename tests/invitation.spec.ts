import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
const key = 'invitation:rsvp:v1:sofia-birthday-2026';
async function open(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Пропустити вступ' }).click();
  await expect(page.locator('.opening')).not.toBeVisible();
}
test('invitation opens, replays, skips, and traps keyboard focus', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.opening')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(async () =>
      page.locator('#opening-title').evaluate((el) => {
        const r = el.getBoundingClientRect();
        const layers = document.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        const face = layers.indexOf(document.querySelector('.ticket-main')!);
        const back = layers.indexOf(document.querySelector('.ticket-back')!);
        return face >= 0 && (back < 0 || face < back);
      }),
    )
    .toBe(true);
  await page.getByRole('button', { name: 'Відкрити запрошення', exact: true }).click();
  await expect(page.locator('.opening')).not.toBeVisible();
  await expect(page.locator('#hero-title')).toBeFocused();
  await page.getByRole('button', { name: 'Відкрити знову' }).click();
  await expect(page.locator('.opening-inner')).toHaveCSS('opacity', '1');
  await expect(
    page.getByRole('button', { name: 'Відкрити запрошення', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect
    .poll(() => page.locator('.opening').evaluate((node) => node.contains(document.activeElement)))
    .toBe(true);
  // Dev-only annotation controls also participate in the dialog's tab order.
  await page.getByRole('button', { name: 'Пропустити вступ' }).focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('.opening')).not.toBeVisible();
  await expect(page.locator('#hero-title')).toBeFocused();
});
test('new visits and reloads start with a fresh invitation at the top', async ({ page }) => {
  await page.goto('/#rsvp');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.opening')).toBeVisible();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('button', { name: 'Відкрити запрошення', exact: true }).click();
  await expect(page.locator('.opening')).not.toBeVisible();
  await expect(page.locator('#hero-title')).toBeInViewport();
  await page.locator('header .nav-rsvp').click();
  await expect(page.locator('#rsvp-title')).toBeInViewport();
  await page.evaluate(() => history.replaceState(history.state, '', '#rsvp'));
  await page.reload();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.opening')).toBeVisible();
  await expect(page.locator('.opening-inner')).toHaveCSS('opacity', '1');
  await expect(
    page.getByRole('button', { name: 'Відкрити запрошення', exact: true }),
  ).toBeEnabled();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('button', { name: 'Відкрити запрошення', exact: true }).click();
  await expect(page.locator('.opening')).not.toBeVisible();
  await expect(page.locator('#hero-title')).toBeInViewport();
});
test('restored browser pages reload the invitation while preserving RSVP', async ({ page }) => {
  await open(page);
  const response = {
    version: 1,
    name: 'Ліза',
    attendance: 'yes',
    guests: 1,
    message: 'До зустрічі!',
    updatedAt: new Date().toISOString(),
  };
  await page.evaluate(
    ({ key, response }) => {
      localStorage.setItem(key, JSON.stringify(response));
      document.documentElement.dataset.previousVisit = 'true';
    },
    { key, response },
  );
  // Chromium automation disables bfcache; exercise its real pageshow signal directly.
  await Promise.all([
    page.waitForEvent('load'),
    page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
    ),
  ]);
  await expect(page.locator('html')).not.toHaveAttribute('data-previous-visit');
  await expect(page.locator('.opening')).toBeVisible();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)).toEqual(
    response,
  );
  await page.getByRole('button', { name: 'Пропустити вступ' }).click();
  await expect(page.locator('.rsvp-success')).toContainText('Ліза!');
});
test('gallery opens, changes by button and keyboard, closes with focus return', async ({
  page,
}) => {
  await open(page);
  const trigger = page.getByRole('button', { name: 'Відкрити фото: За зустрічі, яких бракувало' });
  await trigger.click();
  const modal = page.getByRole('dialog', { name: 'Перегляд фотографій' });
  await expect(modal).toBeVisible();
  await expect(modal.locator('img')).toHaveAttribute('src', '/images/cocktails.jpg');
  await page.getByRole('button', { name: 'Наступне фото' }).click();
  await expect(modal.locator('img')).toHaveAttribute('src', '/images/afterhours-dance.webp');
  await page.keyboard.press('ArrowRight');
  await expect(modal.locator('img')).toHaveAttribute('src', '/images/afterhours-flash.webp');
  await page.keyboard.press('ArrowRight');
  await expect(modal.locator('img')).toHaveAttribute('src', '/images/cocktails.jpg');
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test('candle responds by keyboard and can be lit again', async ({ page }) => {
  await open(page);
  const candle = page.getByRole('button', { name: 'Задмухати свічку' });
  await candle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Нехай усі бажання здійснюються!', { exact: true })).toBeVisible();
  await expect(page.locator('.candle-art')).toHaveClass(/blown/);
  await page.getByRole('button', { name: 'Ще одне бажання' }).click();
  await expect(candle).toHaveAttribute('aria-disabled', 'false');
});
test('RSVP validates, persists, edits and deletes a response', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Зберегти відповідь', exact: true }).click();
  await expect(page.getByText('Напиши ім’я — щонайменше 2 символи.')).toBeVisible();
  await expect(page.locator('#guest-name')).toBeFocused();
  await page.locator('#guest-name').fill('  Ліза  ');
  await page.getByRole('button', { name: 'Зберегти відповідь', exact: true }).click();
  await expect(page.getByText('Обери, чи зможеш приєднатися.')).toBeVisible();
  await page.getByRole('radio', { name: 'Так, із задоволенням!' }).check();
  await page.locator('#guests').selectOption('2');
  await page.locator('#guest-message').fill('Чекаю на наш вечір!');
  await page.getByRole('button', { name: 'Зберегти відповідь', exact: true }).click();
  await expect(page.locator('.rsvp-success')).toBeVisible();
  await expect(page.locator('.rsvp-success h3')).toBeFocused();
  expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key)).toMatchObject({
    name: 'Ліза',
    attendance: 'yes',
    guests: 2,
    message: 'Чекаю на наш вечір!',
  });
  await page.reload();
  await page.getByRole('button', { name: 'Пропустити вступ' }).click();
  await expect(page.locator('.rsvp-success')).toContainText('Ліза!');
  await page.getByRole('button', { name: 'Змінити відповідь' }).click();
  await expect(page.locator('#guest-name')).toHaveValue('Ліза');
  await page.getByRole('radio', { name: 'На жаль, не зможу' }).check();
  await expect(page.locator('#guests')).toHaveCount(0);
  await page.getByRole('button', { name: 'Зберегти зміни' }).click();
  await expect(page.locator('.response-summary')).toContainText('На жаль, не зможу');
  expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!).guests, key)).toBe(1);
  await page.getByRole('button', { name: 'Видалити', exact: true }).click();
  await expect(page.locator('#guest-name')).toHaveValue('');
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBeNull();
});
test('storage denial keeps entered data and reports failure honestly', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await open(page);
  await page.locator('#guest-name').fill('Марія');
  await page.getByRole('radio', { name: 'Так, із задоволенням!' }).check();
  await page.getByRole('button', { name: 'Зберегти відповідь', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Браузер не дозволяє зберегти відповідь');
  await expect(page.locator('.rsvp-success')).toHaveCount(0);
  await expect(page.locator('#guest-name')).toHaveValue('Марія');
});
test('calendar downloads a valid UTF-8 ICS with exact UTC event time', async ({ page }) => {
  await open(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Додати в календар' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('sofia-birthday-2026.ics');
  const raw = await readFile((await download.path())!, 'utf8');
  const text = raw.replace(/\r\n /g, '');
  expect(text).toContain('BEGIN:VCALENDAR\r\nVERSION:2.0');
  expect(text).toContain('DTSTART:20261128T160000Z');
  expect(text).toContain('DTEND:20261128T210000Z');
  expect(text).toContain('SUMMARY:День народження Софії');
  expect(text).toContain('Локацію'.toLowerCase());
  expect(raw).not.toContain('�');
  for (const line of raw.split('\r\n'))
    expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75);
  await expect(page.getByRole('link', { name: 'Прокласти маршрут' })).toHaveCount(0);
});
test('countdown handles exact start and a passed event without negative numbers', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-11-28T15:59:50Z') });
  await open(page);
  await expect(page.locator('.countdown>div').nth(3).locator('span')).toHaveText(/0[0-9]|10/);
  await page.clock.fastForward('00:20');
  await expect(page.getByText('Наш вечір уже настав', { exact: true })).toBeVisible();
  await expect(page.locator('.countdown>div span')).toHaveText(['00', '00', '00', '00']);
});
test('no runtime errors, broken images, external requests or accessibility violations', async ({
  page,
}) => {
  const errors: string[] = [];
  const failed: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('requestfailed', (req) => failed.push(req.url()));
  page.on('request', (req) => {
    if (
      !req.url().startsWith('http://127.0.0.1:') &&
      !req.url().startsWith('data:') &&
      !req.url().startsWith('blob:')
    )
      external.push(req.url());
  });
  await page.goto('/');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Пропустити вступ' }).click();
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 50));
    }
  });
  await expect
    .poll(() =>
      page
        .locator('img')
        .evaluateAll((imgs) => imgs.every((img) => img.complete && img.naturalWidth > 0)),
    )
    .toBe(true);
  const audit = await new AxeBuilder({ page }).analyze();
  expect(audit.violations).toEqual([]);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  expect(external).toEqual([]);
});
test('touch gallery swipe and native scroll remain usable', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await open(page);
  expect(await page.evaluate(() => document.documentElement.dataset.smoothScroll)).toBeUndefined();
  await page.getByRole('button', { name: 'Відкрити фото: За зустрічі, яких бракувало' }).tap();
  const content = page.locator('.lightbox-content');
  await content.dispatchEvent('touchstart', {
    touches: [{ identifier: 1, clientX: 280, clientY: 200 }],
  });
  await content.dispatchEvent('touchend', {
    changedTouches: [{ identifier: 1, clientX: 70, clientY: 200 }],
  });
  await expect(page.locator('.lightbox img')).toHaveAttribute(
    'src',
    '/images/afterhours-dance.webp',
  );
  await page.getByRole('button', { name: 'Закрити фото' }).tap();
  await page.getByRole('button', { name: 'Задмухати свічку' }).tap();
  await expect(page.locator('.candle-art')).toHaveClass(/blown/);
});
test('reduced motion disables smooth scrolling, parallax and flame loops', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'reduced-motion');
  await open(page);
  expect(await page.evaluate(() => document.documentElement.dataset.smoothScroll)).toBeUndefined();
  await expect(page.locator('.hero-photo img')).toHaveCSS('transform', 'none');
  await expect(page.locator('.candle-flame')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Відкрити знову' }).click();
  await page.getByRole('button', { name: 'Відкрити запрошення', exact: true }).click();
  await expect(page.locator('.opening')).not.toBeVisible();
});
