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
    await expect(classes).toBeVisible();
    await expect(classes).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'photo', exact: true })).toBeVisible();
});

test('outputs tab expands results and collapses frames', async ({ page }) => {
    const listed: string[] = [];
    page.on('request', request => {
        if (request.url().includes('/outputs/files')) listed.push(request.url());
    });
    await open(page, `/runs/${RUN}/show/outputs`);
    const results = page.getByRole('row').filter({ hasText: 'Results' });
    await expect(results.getByRole('button', { name: 'Collapse' })).toBeVisible();
    await expect(page.getByText('ortho.png', { exact: true })).toBeVisible();

    const frames = page.getByRole('row').filter({ hasText: 'frames' });
    await expect(frames.getByRole('button', { name: 'Expand' })).toBeVisible();
    await expect(frames).toContainText(/\d+ files/);
    expect(listed.some(url => url.includes('purpose=frames'))).toBe(false);

    await frames.click();
    await expect.poll(() => listed.some(url => url.includes('purpose=frames'))).toBe(true);
});

test('outputs header counts every archived file', async ({ page }) => {
    await open(page, `/runs/${RUN}/show/outputs`);
    const header = page.getByText(/^\d+ files, /);
    await expect(header).toBeVisible();
    await expect(header).not.toContainText('listing');

    const total = Number(/^(\d+) files/.exec((await header.textContent()) ?? '')?.[1]);
    const counts = await page
        .getByRole('row')
        .getByText(/^\d+ files?$/)
        .allTextContents();
    const summed = counts.reduce((sum, text) => sum + Number(text.split(' ')[0]), 0);
    expect(summed).toBe(total);
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
