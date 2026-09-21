import { expect, test } from '@playwright/test';

import { open } from './console';

const UNASSIGNED_TRANSECT = 'cef0fa30-d1b4-4112-8ea5-ec53efeb9a7e';

test.describe.serial('catalogue', () => {
    const stamp = Date.now();
    const siteName = `e2e site ${stamp}`;
    const transectName = `e2e transect ${stamp}`;

    test('creates a site', async ({ page }) => {
        await open(page, '/sites/create');
        await page.getByRole('textbox', { name: /^Name/ }).fill(siteName);
        await page.getByRole('textbox', { name: /^Country/ }).fill('Testland');
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page).toHaveURL(/#\/sites\/[0-9a-f-]+\/show/);
        await expect(page.getByText(siteName)).toBeVisible();
    });

    test('creates a transect at the site and validates it', async ({ page }) => {
        await open(page, '/transects/create');
        await page.getByRole('combobox', { name: 'Site' }).click();
        await page.getByRole('option', { name: siteName }).click();
        await page.getByRole('textbox', { name: /^Name/ }).fill(transectName);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page).toHaveURL(/#\/transects\/[0-9a-f-]+\/show/);
        await expect(page.getByText(transectName)).toBeVisible();

        const validate = page.getByRole('button', { name: 'Validate' });
        await expect(validate).toBeEnabled();
        await validate.click();
        await expect(page.getByText('Validated', { exact: true })).toBeVisible();
        await expect(validate).toHaveCount(0);
    });

    test('a transect without a site cannot be validated', async ({ page }) => {
        await open(page, `/transects/${UNASSIGNED_TRANSECT}/show`);
        await expect(page.getByText('No site. Validation needs one.')).toBeVisible();
        const validate = page.getByRole('button', { name: 'Validate' });
        await expect(validate).toBeDisabled();
        await validate.locator('..').hover();
        await expect(page.getByRole('tooltip', { name: 'Assign a site first' })).toBeVisible();
    });
});
