import { expect, test } from '@playwright/test';

import { open } from './console';

const RUN = 'b17d9e80-5c4e-4683-a6e3-db84147d12fc';
const TABS = ['Overview', 'Cover', 'Outputs', '3D cloud', 'Performance'];

test('run show has the five tabs', async ({ page }) => {
    await open(page, `/runs/${RUN}/show`);
    for (const name of TABS) {
        await expect(page.getByRole('tab', { name, exact: true })).toBeVisible();
    }
});

test('cover tab shows the ortho image or the archive hint', async ({ page }) => {
    await open(page, `/runs/${RUN}/show/cover`);
    const image = page.getByRole('img', { name: 'Ortho image' });
    const hint = page.getByText(/ortho image (appears|still uploading)/i);
    await expect(image.or(hint)).toBeVisible();
});

test('outputs tab expands results and collapses frames', async ({ page }) => {
    await open(page, `/runs/${RUN}/show/outputs`);
    const results = page.getByRole('row').filter({ hasText: 'Results' });
    await expect(results.getByRole('button', { name: 'Collapse' })).toBeVisible();
    await expect(page.getByText('ortho.png', { exact: true })).toBeVisible();

    const frames = page.getByRole('row').filter({ hasText: 'frames' });
    await expect(frames.getByRole('button', { name: 'Expand' })).toBeVisible();
    await expect(frames).toContainText(/\d+ files/);
});
