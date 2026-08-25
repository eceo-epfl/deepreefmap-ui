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

test('cover tab draws the classes, with the photo behind a switch', async ({ page }) => {
    await open(page, `/runs/${RUN}/show/cover`);
    const classes = page.getByRole('button', { name: 'classes', exact: true });
    const hint = page.getByText(/ortho appears once/i);
    await expect(classes.or(hint)).toBeVisible();
    if (await classes.isVisible()) {
        await expect(classes).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('button', { name: 'photo', exact: true })).toBeVisible();
    }
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

test('outputs offer one zip for everything and one per group', async ({ page }) => {
    await open(page, `/runs/${RUN}/show/outputs`);
    await expect(page.getByRole('button', { name: 'Download all' })).toBeVisible();

    const results = page.getByRole('row').filter({ hasText: 'Results' });
    const minted = page.waitForRequest(request => request.url().includes('outputs/bundle'));
    await results.getByRole('button', { name: 'Zip' }).click();
    const request = await minted;
    expect(request.url()).toContain('purpose=Results');
});
