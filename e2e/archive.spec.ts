import { expect, test } from '@playwright/test';

import { open } from './console';

test('archive tabs list runs, clips and objects', async ({ page }) => {
    await open(page, '/stored_objects');
    await expect(page.getByRole('tab', { name: /^Runs/ })).toHaveAttribute(
        'aria-selected',
        'true',
    );
    await expect(page.getByRole('row').filter({ hasText: '550' })).toHaveCount(1);

    await page.getByRole('tab', { name: /^Clips/ }).click();
    await expect(page.getByRole('link', { name: /\.MP4$/i })).toBeVisible();

    await page.getByRole('tab', { name: 'Objects' }).click();
    await expect(page).toHaveURL(/tab=objects/);
    await expect(page.getByRole('columnheader', { name: 'Content hash' })).toBeVisible();
});
