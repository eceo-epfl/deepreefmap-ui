import { expect, test, type Page } from '@playwright/test';

import { open } from './console';

/** A profile document the registry will accept, at a given focal length. */
const document = (name: string, focal: number) =>
    JSON.stringify({
        name,
        source: 'colmap_radial_v1',
        distorted: {
            model: 'RADIAL',
            params: { fx: focal, fy: focal, cx: 960.0, cy: 540.0, k1: 0.36, k2: 0.24 },
        },
        rectified_pinhole: {
            image_size: [1920, 1080],
            K: [
                [focal, 0.0, 959.5],
                [0.0, focal, 539.5],
                [0.0, 0.0, 1.0],
            ],
        },
    });

test.describe.serial('cameras', () => {
    const stamp = Date.now();
    const rig = `e2e_rig_${stamp}`;

    const add = async (page: Page, body: string) => {
        await open(page, '/camera_profiles');
        await page.getByRole('button', { name: 'Add calibration' }).click();
        await page.getByLabel('Profile name').fill(rig);
        await page.getByLabel('Document').fill(body);
    };

    test('publishes a first calibration without questioning it', async ({ page }) => {
        await add(page, document(rig, 1243.0));
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await expect(page.getByText(`Stored as version 1 of ${rig}.`)).toBeVisible();
    });

    test('asks before publishing one that changes the optics', async ({ page }) => {
        await add(page, document(rig, 1600.0));
        await page.getByRole('button', { name: 'Add', exact: true }).click();

        await expect(page.getByText(`This changes the optics of ${rig}.`)).toBeVisible();
        await expect(page.getByText(/Focal length 1243 px to 1600 px/)).toBeVisible();
        await expect(page.getByLabel('Document')).toBeVisible();

        await page.getByRole('button', { name: 'Add anyway' }).click();
        await expect(page.getByText(`Stored as version 2 of ${rig}.`)).toBeVisible();
    });

    test('deploys a calibration and follows it back to the newest', async ({ page }) => {
        await open(page, '/camera_profiles');
        await page.getByText(rig).click();
        await expect(page.getByText('Newest published, version 2')).toBeVisible();

        // Deploy version 1, the older measurement: the profile stops tracking the newest.
        const rows = page.getByRole('row');
        await rows
            .filter({ hasText: '1' })
            .getByRole('button', { name: 'Deploy' })
            .last()
            .click();
        await expect(page.getByText('Laptops now take version 1.')).toBeVisible();
        await expect(page.getByText(/Version 2 is published but not deployed/)).toBeVisible();

        await page.getByRole('button', { name: 'Follow newest' }).click();
        await page.getByRole('button', { name: /confirm/i }).click();
        await expect(page.getByText('Laptops now take the newest calibration.')).toBeVisible();
    });
});
