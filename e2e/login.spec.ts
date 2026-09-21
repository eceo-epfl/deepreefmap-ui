import { expect, test } from '@playwright/test';

import { signIn } from './console';

test('admin lands on the dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Latest uploads')).toBeVisible();
    await expect(page.getByText('Recently changed transects')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Transects' })).toBeVisible();
});

test.describe('without a realm role', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('norole sees the no-access screen', async ({ page }) => {
        await signIn(page, 'norole', 'norole');
        await expect(page.getByText('You are signed in without access')).toBeVisible();
        await expect(page.getByRole('menuitem', { name: 'Transects' })).toHaveCount(0);
    });
});
