import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // Desktop project skips the mobile-only e2e coverage.
      testIgnore: /dashboard-mobile/,
    },
    // Mobile project for MOBILE_REDESIGN_PLAN Phase 1 e2e coverage.
    // Uses iPhone SE viewport (375x800) per the plan's critical-device list.
    {
      name: 'mobile-chromium',
      use: { ...devices['iPhone SE'] },
      testMatch: /dashboard-mobile/,
    },
  ],
  webServer: {
    // Webpack fallback: Next.js 16's default Turbopack panics on the pnpm
    // symlinked node_modules layout (Invalid symlink — turbopack-error T1).
    // Dev server itself runs via webpack for both desktop and mobile e2e.
    // Production builds are unaffected and continue to use Turbopack.
    command: 'npm run dev -- --webpack',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
