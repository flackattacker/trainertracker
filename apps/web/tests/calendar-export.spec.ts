import { test, expect, Page, BrowserContext } from '@playwright/test';
// @ts-ignore
import fs from 'fs';

const TRAINER_EMAIL = 'jonflack@gmail.com';
const TRAINER_PASSWORD = 'password123';
const CLIENT_EMAIL = 'sarah.johnson@email.com';
const CLIENT_PASSWORD = 'password123';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function login(page: Page, email: string, password: string, userType: 'trainer' | 'client') {
  await page.goto(`${BASE_URL}/${userType === 'trainer' ? 'login' : 'client/login'}`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

test.describe('Calendar Export', () => {
  test('Trainer can export calendar as .ics', async ({ page }: { page: Page }) => {
    await login(page, TRAINER_EMAIL, TRAINER_PASSWORD, 'trainer');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('text=Export');
    await expect(page.locator('h3')).toHaveText('Export Calendar');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export to Calendar")')
    ]);
    const path = await download.path();
    const content = fs.readFileSync(path, 'utf-8');
    expect(content).toContain('BEGIN:VCALENDAR');
    expect(content).toContain('SUMMARY:');
    expect(download.suggestedFilename()).toMatch(/trainertracker-sessions-trainer-.*\.ics/);
  });

  test('Client can export calendar as .ics', async ({ page }: { page: Page }) => {
    await login(page, CLIENT_EMAIL, CLIENT_PASSWORD, 'client');
    await page.goto(`${BASE_URL}/client/dashboard`);
    await page.click('text=Export');
    await expect(page.locator('h3')).toHaveText('Export Calendar');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export to Calendar")')
    ]);
    const path = await download.path();
    const content = fs.readFileSync(path, 'utf-8');
    expect(content).toContain('BEGIN:VCALENDAR');
    expect(content).toContain('SUMMARY:');
    expect(download.suggestedFilename()).toMatch(/trainertracker-sessions-client-.*\.ics/);
  });
}); 