'use client';

import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { Card } from '@astryxdesign/core/Card';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';

const FEATURES = [
  {
    title: 'SP, SB, SD campaigns',
    description: 'Full creation wizard matching the real Amazon Ads Console. Sponsored Products, Brands, and Display.',
  },
  {
    title: 'Realistic simulation',
    description: '7-day performance data with ROAS, ACOS, CPC, and search term generation per match type.',
  },
  {
    title: 'Targeting training',
    description: 'Automatic, manual keyword, and product targeting. Exact, phrase, and broad match types.',
  },
  {
    title: 'Budget and bidding',
    description: 'Dynamic bid strategies, placement adjustments, and budget rules.',
  },
  {
    title: 'Search term mining',
    description: 'Generate and analyze search terms. Identify winners to harvest and losers to negate.',
  },
  {
    title: 'No API required',
    description: 'Pure client-side simulator. No Amazon API access needed. Train unlimited VAs.',
  },
];

export default function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-brand">
            AdConsole
            <Badge label="Training" variant="blue" />
          </Link>
          <nav className="landing-nav-links" aria-label="Account">
            <Link href="/auth/login" className="landing-link">Sign in</Link>
            <Link href="/auth/register" className="landing-link">Sign up</Link>
            <Link href="/" className="landing-cta">Open simulator</Link>
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-container">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="landing-hero-copy"
          >
            <h1 className="landing-h1">
              Train your team on the real Amazon Ads Console
            </h1>
            <p className="landing-lede">
              A replica of Amazon&apos;s advertising platform. Create campaigns, optimize bids,
              and mine search terms without touching a live account.
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="landing-cta-row"
          >
            <Link href="/" className="landing-cta landing-cta--primary">
              Open simulator
            </Link>
            <a
              href="https://github.com/projectamazonph/Amazon-ad-console"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-cta landing-cta--ghost"
            >
              View source
            </a>
          </motion.div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-h2">What you get</h2>
          <div className="landing-grid">
            {FEATURES.map((feature, i) => (
              <motion.article
                key={feature.title}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card padding={5} variant="default">
                  <Stack gap={2}>
                    <Text type="large" weight="semibold" maxLines={2} hasTruncateTooltip>
                      {feature.title}
                    </Text>
                    <Text type="body" color="secondary" maxLines={6} hasTruncateTooltip>
                      {feature.description}
                    </Text>
                  </Stack>
                </Card>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-cta-band">
        <div className="landing-container landing-container--center">
          <h2 className="landing-h2">Ready to train your team?</h2>
          <p className="landing-lede">No API access required. No live account risk.</p>
          <Link href="/" className="landing-cta landing-cta--primary">
            Open simulator
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <Text tone="muted">Amazon Ad Console Training Simulator</Text>
          <div className="landing-footer-links">
            <a
              href="https://github.com/projectamazonph/Amazon-ad-console"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-link"
            >
              GitHub
            </a>
            <Text tone="muted">Not affiliated with Amazon</Text>
          </div>
        </div>
      </footer>
    </div>
  );
}
