import { expect, test } from '@playwright/test';

import { GLOSSARY } from '../src/contract/glossary';

const ENTRIES: [string, string][] = [
    ['Sites', GLOSSARY.sites],
    ['Transects', GLOSSARY.transects],
    ['Runs', GLOSSARY.runs],
    ['Archive', GLOSSARY.stored_objects],
];

test('sidebar entries show the glossary line on hover', async ({ page }) => {
    await page.goto('/');
    for (const [label, line] of ENTRIES) {
        await page.getByRole('menuitem', { name: label, exact: true }).hover();
        await expect(page.getByRole('tooltip')).toHaveText(line);
        await page.mouse.move(0, 0);
        await expect(page.getByRole('tooltip')).toHaveCount(0);
    }
});
