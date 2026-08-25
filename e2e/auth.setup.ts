import { expect, test as setup } from '@playwright/test';

import { signIn } from './console';
import { ADMIN_STATE } from './playwright.config';

setup('sign in as admin', async ({ page }) => {
    await signIn(page, 'admin', 'admin');
    await expect(page.getByText('Latest uploads')).toBeVisible();
    await page.context().storageState({ path: ADMIN_STATE });
});
