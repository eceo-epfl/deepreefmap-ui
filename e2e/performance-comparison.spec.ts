import { expect, test } from '@playwright/test';

const distribution = { n: 2, min: 10, q1: 15, median: 20, q3: 25, max: 30 };
const configuration = {
    id: 'run',
    device_id: 'device',
    device_name: 'Workstation',
    known: true,
    basis: 'process',
    status: 'completed',
    frames: 200,
    duration_s: 400,
    recorded_at: '2026-09-21T12:00:00Z',
    settings: {
        processing_width: 1376,
        processing_height: 768,
        fps: 5,
        preprocess_batch_size: 4,
        mapping_backend: 'loger',
        segmentation_model: 'seg',
    },
    hardware: { total_ram_bytes: 100 },
    ram: 30,
    swap: 0,
    vram: null,
    seconds_per_frame: 2,
};
const baseline = {
    configuration,
    count: 2,
    completed: 2,
    failed: 0,
    workload: { ...distribution, min: 100, max: 200 },
    stats: {
        ram: distribution,
        swap: { n: 2, min: 0, q1: 0, median: 0, q3: 0, max: 0 },
        vram: { n: 0 },
        seconds_per_frame: { n: 2, min: 1, q1: 1.25, median: 1.5, q3: 1.75, max: 2 },
    },
};

for (const view of ['performance', 'device', 'preset']) {
    test(`${view} consolidates observations and reveals evidence`, async ({
        page,
    }, testInfo) => {
        await page.route('**/api/presets?**', route =>
            route.fulfill({ json: [], headers: { 'Content-Range': 'presets 0-0/0' } }),
        );
        await page.route('**/api/performance/summary', route =>
            route.fulfill({ json: { groups: [] } }),
        );
        await page.route('**/api/performance/comparison?**', route => {
            const url = new URL(route.request().url());
            if (view === 'device') expect(url.searchParams.get('device_id')).toBe('device');
            if (view === 'preset') expect(url.searchParams.get('preset_name')).toBe('Reef');
            const alternative = {
                ...baseline,
                configuration: {
                    ...configuration,
                    id: 'other',
                    settings: { ...configuration.settings, fps: 10 },
                },
            };
            return route.fulfill({
                json: {
                    configurations: [configuration, alternative.configuration],
                    groups: url.searchParams.has('min_frames') ? [] : [baseline, alternative],
                    baseline: url.searchParams.has('min_frames') ? null : baseline,
                    alternatives:
                        url.searchParams.get('parameter') === 'fps' ? [alternative] : [],
                },
            });
        });
        await page.route('**/api/performance/evidence?**', route =>
            route.fulfill({ json: { rows: [configuration], total: 1, offset: 0 } }),
        );
        await page.goto(`/e2e/performance-harness.html?view=${view}`);
        await expect(page.getByTestId('performance-configuration')).toHaveCount(2);
        await expect(page.getByText('1376 × 768 · 5 fps', { exact: true })).toBeVisible();
        await expect(page.getByText('1376 × 768 · 10 fps', { exact: true })).toBeVisible();
        await expect(page.getByText(/DeepReefMap memory/)).toBeVisible();
        await expect(page.getByTestId('performance-run')).toHaveCount(0);
        await expect(
            page.getByRole('img', { name: 'RAM distribution', exact: true }),
        ).toHaveCount(2);
        await expect(page.getByLabel('Minimum frames')).toHaveCount(0);
        await page.screenshot({ path: testInfo.outputPath('summary.png'), fullPage: true });
        await page
            .getByRole('button', { name: /2 runs/ })
            .first()
            .click();
        await expect(page.getByTestId('performance-run')).toHaveCount(1);
        await expect(
            page.getByRole('img', { name: 'RAM distribution', exact: true }),
        ).toHaveCount(3);
        await page.getByRole('button', { name: 'Filters', exact: true }).click();
        await page.getByLabel('Minimum frames').fill('300');
        await expect(page.getByText('No recorded runs match these filters.')).toBeVisible();
        await page.getByLabel('Maximum frames').fill('200');
        await expect(page.getByRole('alert')).toContainText('minimum no greater than maximum');
    });
}

test('comparison reports API failures', async ({ page }) => {
    await page.route('**/api/performance/comparison?**', route =>
        route.fulfill({ status: 503, json: { error: 'Unavailable' } }),
    );
    await page.goto('/e2e/performance-harness.html?view=device');
    await expect(page.getByRole('alert')).toContainText('Performance comparison unavailable');
});
