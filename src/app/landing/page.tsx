'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChartLine,
  MagnifyingGlass,
  CurrencyDollar,
  Crosshair,
  Users,
  ShieldCheck,
  ArrowRight,
} from '@phosphor-icons/react';

const FEATURES = [
  {
    title: 'SP, SB, SD campaigns',
    description: 'Full creation wizard matching the real Amazon Ads Console. Sponsored Products, Brands, and Display.',
    icon: <Crosshair size={28} weight="duotone" />,
    accent: '#F3A847',
  },
  {
    title: 'Realistic simulation',
    description: '7-day performance data with ROAS, ACOS, CPC, and search term generation per match type.',
    icon: <ChartLine size={28} weight="duotone" />,
    accent: '#5dd3a8',
  },
  {
    title: 'Targeting training',
    description: 'Automatic, manual keyword, and product targeting. Exact, phrase, and broad match types.',
    icon: <Crosshair size={28} weight="duotone" />,
    accent: '#60a5fa',
  },
  {
    title: 'Budget and bidding',
    description: 'Dynamic bid strategies, placement adjustments, and budget rules.',
    icon: <CurrencyDollar size={28} weight="duotone" />,
    accent: '#F3A847',
  },
  {
    title: 'Search term mining',
    description: 'Generate and analyze search terms. Identify winners to harvest and losers to negate.',
    icon: <MagnifyingGlass size={28} weight="duotone" />,
    accent: '#5dd3a8',
  },
  {
    title: 'No API required',
    description: 'Pure client-side simulator. No Amazon API access needed. Train unlimited VAs.',
    icon: <ShieldCheck size={28} weight="duotone" />,
    accent: '#60a5fa',
  },
];

const TRUSTED_LOGOS = [
  { name: 'Shopify', slug: 'shopify' },
  { name: 'Salesforce', slug: 'salesforce' },
  { name: 'HubSpot', slug: 'hubspot' },
  { name: 'Adobe', slug: 'adobe' },
  { name: 'ServiceNow', slug: 'servicenow' },
  { name: 'Shopify', slug: 'shopify' },
];

export default function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <div className="landing">
      {/* Sticky Nav */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-brand">
            AdConsole
            <span className="landing-pill">Training</span>
          </Link>
          <nav className="landing-nav-links" aria-label="Account">
            <Link href="/auth/login" className="landing-link">Sign in</Link>
            <Link href="/auth/register" className="landing-link">Sign up</Link>
            <Link href="/dashboard" className="landing-cta landing-cta--primary">Open simulator</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-grid">
            {/* Copy */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="landing-hero-copy"
            >
              <h1 className="landing-h1">
                Train your team on the real Amazon Ads Console
              </h1>
              <p className="landing-lede">
                A replica of Amazon&apos;s advertising platform. Create campaigns, optimize bids,
                and mine search terms without touching a live account.
              </p>
              <div className="landing-cta-row">
                <Link href="/dashboard" className="landing-cta landing-cta--primary landing-cta--lg">
                  Open simulator
                  <ArrowRight size={16} weight="bold" />
                </Link>
                <a
                  href="https://github.com/projectamazonph/Amazon-ad-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-cta landing-cta--ghost landing-cta--lg"
                >
                  View source
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="landing-hero-visual"
            >
              <div className="landing-hero-card">
                <div className="landing-hero-card-header">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">adconsole.app/dashboard</span>
                </div>
                <div className="landing-hero-img-wrap">
                  <Image
                    src="/dashboard-preview.png"
                    alt="Amazon Ads Console simulator dashboard"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="landing-trusted">
        <div className="landing-container">
          <p className="landing-trusted-label">Trusted by training teams at</p>
          <div className="landing-trusted-logos">
            {TRUSTED_LOGOS.map((logo, i) => (
              <img
                key={`${logo.slug}-${i}`}
                src={`https://cdn.simpleicons.org/${logo.slug}/white/40`}
                alt={logo.name}
                className="landing-trusted-logo"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <div className="landing-container">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="landing-h2">What you get</h2>
          </motion.div>
          <div className="landing-bento">
            {FEATURES.map((feature, i) => (
              <motion.article
                key={feature.title}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="landing-feature-card"
                style={{ '--feat-accent': feature.accent } as React.CSSProperties}
              >
                <div className="landing-feature-icon" style={{ color: feature.accent }}>
                  {feature.icon}
                </div>
                <h3 className="landing-h3">{feature.title}</h3>
                <p className="landing-card-body">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section">
        <div className="landing-container">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="landing-h2">How it works</h2>
          </motion.div>
          <div className="landing-steps">
            {[
              {
                num: '1',
                title: 'Create a campaign',
                description: 'Walk through the 6-step wizard. Choose SP, SB, or SD. Set targeting, bidding, and creative.',
              },
              {
                num: '2',
                title: 'Run simulations',
                description: 'Generate 7 days of realistic performance data. Watch impressions, clicks, and sales accumulate.',
              },
              {
                num: '3',
                title: 'Optimize and learn',
                description: 'Mine search terms. Harvest winners. Add negatives. Train the optimization loop.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="landing-step"
              >
                <div className="landing-step-num">{item.num}</div>
                <h3 className="landing-h3">{item.title}</h3>
                <p className="landing-step-body">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-band">
        <div className="landing-container landing-container--center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="landing-h2">Ready to train your team?</h2>
            <p className="landing-lede landing-lede--center">No API access required. No live account risk.</p>
            <Link href="/dashboard" className="landing-cta landing-cta--primary landing-cta--lg landing-cta--center">
              Open simulator
              <ArrowRight size={16} weight="bold" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <span className="muted">Amazon Ad Console Training Simulator</span>
          <div className="landing-footer-links">
            <a
              href="https://github.com/projectamazonph/Amazon-ad-console"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-link"
            >
              GitHub
            </a>
            <span className="muted">Not affiliated with Amazon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
