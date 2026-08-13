import type { NextConfig } from 'next';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      { source: '/landing', destination: '/', permanent: false },
    ];
  },

  // Standalone output — required by the production Dockerfile, which copies
  // .next/standalone/ into the runtime stage. Without this flag Next 16
  // never emits the standalone directory and the COPY step fails.
  // See audit H-12.
  output: 'standalone',

  // Pin Turbopack's workspace root. On non-standard mount paths (e.g. NAS
  // mounts at /run/csi/mount-root/...) Turbopack's auto-inference misses
  // the project root and `next build` fails with
  // "We couldn't find the Next.js package from the project directory".
  // Pinning __dirname keeps the build portable across environments.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Content Security Policy. `'unsafe-inline'` is allowed for
          // script-src and style-src because Next.js 16's prod build still
          // emits inline styles/scripts; locking this down further would
          // require nonce plumbing and was out of scope for this PR.
          // `connect-src` allows the Neon Postgres host family.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "img-src 'self' data: https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "connect-src 'self' https://*.neon.tech",
              "frame-ancestors 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          // HSTS — only sent over HTTPS, so safe to ship on every response.
          ...(isProd
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
          // Lock down powerful APIs the app never uses.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
