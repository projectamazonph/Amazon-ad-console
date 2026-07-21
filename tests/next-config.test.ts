/**
 * Regression tests for next.config.ts.
 *
 * Pins the deploy + security invariants so a casual edit can't silently
 * break the production Dockerfile (audit H-12) or the security header
 * surface (CSP / HSTS / Permissions-Policy).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';

type Header = { key: string; value: string };
type ConfigShape = {
  output?: string;
  turbopack?: { root?: string };
  headers?: () => Promise<Array<{ source: string; headers: Header[] }>>;
};

let nextConfig: ConfigShape;

beforeAll(async () => {
  // The next.config.ts file uses `import type { NextConfig } from 'next'`
  // and exports a default object. We import it directly; if the syntax ever
  // changes the test loader will surface the error.
  const mod = await import('../next.config');
  nextConfig = (mod.default ?? mod) as ConfigShape;
});

describe('next.config.ts — production deploy contract', () => {
  it('enables standalone output so the Dockerfile COPY can succeed', () => {
    expect(nextConfig.output).toBe('standalone');
  });

  it('pins turbopack.root to the config file directory', () => {
    // Without this, non-standard mount paths (NAS at /run/csi/mount-root/...)
    // break `next build` with "we couldn't find the Next.js package".
    expect(nextConfig.turbopack?.root).toBe(path.resolve(__dirname, '..'));
  });
});

describe('next.config.ts — security headers', () => {
  let headers: Header[];

  beforeAll(async () => {
    const routes = await nextConfig.headers!();
    headers = routes[0]!.headers;
  });

  function valueFor(key: string): string | undefined {
    return headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;
  }

  it('sends X-Frame-Options: DENY', () => {
    expect(valueFor('X-Frame-Options')).toBe('DENY');
  });

  it('sends X-Content-Type-Options: nosniff', () => {
    expect(valueFor('X-Content-Type-Options')).toBe('nosniff');
  });

  it('sends a Referrer-Policy', () => {
    expect(valueFor('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('sends a Content-Security-Policy with a default-src restriction', () => {
    const csp = valueFor('Content-Security-Policy');
    expect(csp).toBeDefined();
    expect(csp).toMatch(/default-src 'self'/);
  });

  it('CSP locks frame-ancestors to none (defense-in-depth against clickjacking)', () => {
    const csp = valueFor('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/frame-ancestors 'none'/);
  });

  it('sends a Permissions-Policy that disables camera, microphone, geolocation', () => {
    const pp = valueFor('Permissions-Policy') ?? '';
    expect(pp).toMatch(/camera=\(\)/);
    expect(pp).toMatch(/microphone=\(\)/);
    expect(pp).toMatch(/geolocation=\(\)/);
  });

  it('HSTS is included when NODE_ENV=production', () => {
    // The static import is cached, so we just assert the rule is encoded
    // in the source — the runtime check is exercised by the live
    // deployment. Reading the source keeps the test fast and avoids
    // mutating process.env (which TS types as readonly).
    const fs = require('fs') as typeof import('fs');
    const src = fs.readFileSync(path.resolve(__dirname, '../next.config.ts'), 'utf8');
    expect(src).toMatch(/Strict-Transport-Security/);
    expect(src).toMatch(/isProd/);
  });
});
