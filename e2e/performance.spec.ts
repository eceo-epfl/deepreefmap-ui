import { expect, test } from '@playwright/test';

import { open } from './console';

test('performance lists one row per device with stacked peaks', async ({ page }) => {
    await open(page, '/performance');
    await page.getByRole('button', { name: 'Explore fleet statistics' }).click();
    await expect(page.getByRole('columnheader', { name: /Peaks/ })).toBeVisible();
    const row = page.getByRole('row').filter({ hasText: 'workpc' });
    await expect(row).toHaveCount(1);
    for (const metric of ['RAM', 'Swap', 'VRAM', 'Time']) {
        await expect(row.getByText(metric, { exact: true })).toBeVisible();
    }
});
