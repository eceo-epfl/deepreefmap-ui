import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

export const ADMIN_STATE = path.join(__dirname, '.auth', 'admin.json');

export default defineConfig({
    testDir: __dirname,
    outputDir: path.join(__dirname, 'test-results'),
    fullyParallel: false,
    workers: 1,
    reporter: [
        ['list'],
        ['html', { outputFolder: path.join(__dirname, 'playwright-report'), open: 'never' }],
    ],
    expect: { timeout: 15_000 },
    use: {
        baseURL: 'http://localhost:88',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'setup', testMatch: /auth\.setup\.ts/ },
        {
            name: 'chromium',
            testMatch: /.*\.spec\.ts/,
            use: { ...devices['Desktop Chrome'], storageState: ADMIN_STATE },
            dependencies: ['setup'],
        },
    ],
});
