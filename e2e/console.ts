import { expect, type Page } from '@playwright/test';

/** Opens the console and completes the Keycloak login form it redirects to. */
export const signIn = async (page: Page, username: string, password: string) => {
    await page.goto('/');
    await page.waitForURL(/\/realms\/deepreefmap\//);
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/^http:\/\/localhost:88\//);
};

// Every page load comes back from Keycloak at `/`; the route is set on the hash router
// once the menu has rendered.
export const open = async (page: Page, route: string) => {
    await page.goto('/');
    await expect(page.getByRole('menuitem', { name: 'Dashboard' })).toBeVisible();
    await page.evaluate(hash => {
        window.location.hash = hash;
    }, `#${route}`);
};
