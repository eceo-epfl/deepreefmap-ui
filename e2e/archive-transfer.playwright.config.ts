import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    testMatch: 'archive-transfer.spec.ts',
    outputDir: 'test-results/archive-transfer',
    workers: 1,
});
