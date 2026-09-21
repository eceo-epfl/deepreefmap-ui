import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    outputDir: 'test-results/performance-comparison',
    testMatch: 'performance-comparison.spec.ts',
    use: { baseURL: 'http://127.0.0.1:5187', browserName: 'chromium' },
    webServer: {
        command: '../node_modules/.bin/vite .. --host 127.0.0.1 --port 5187',
        url: 'http://127.0.0.1:5187/e2e/performance-harness.html',
        reuseExistingServer: false,
    },
});
