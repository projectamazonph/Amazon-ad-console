'use client';

import { motion, useReducedMotion, useInView } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const FEATURES = [
  {
    title: 'Campaign Creation Wizard',
    description: 'Build SP, SB, and SD campaigns step by step ΓÇö the same interface you\'ll use in production.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: '7-Day Performance Simulation',
    description: 'Watch realistic metrics build ΓÇö ROAS, ACOS, CPC, impressions ΓÇö exactly like a live campaign.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Search Term Mining',
    description: 'Identify which search terms convert. Harvest winners, negate losers ΓÇö the optimization loop that actually moves ACOS.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: 'Guided Drills',
    description: 'Click-by-click coaching walks you through the console. Track mistakes, earn scores, level up.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Scenario Missions',
    description: 'Real-world challenges from beginner ACOS reduction to advanced auto-targeting. Get scored, get better.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Bulk CSV Operations',
    description: 'Paste your Amazon bulk export. Validate it, preview the changes, apply it ΓÇö no more spreadsheet errors.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Build your first campaign',
    description: 'Choose SP, SB, or SD. Walk through targeting, bidding, and creative settings ΓÇö exactly like the real console.',
  },
  {
    num: '02',
    title: 'Run a 7-day simulation',
    description: 'Generate realistic performance data. Watch impressions, clicks, and sales build up day by day.',
  },
  {
    num: '03',
    title: 'Optimize and repeat',
    description: 'Mine search terms, adjust bids, add negatives. Each loop makes you sharper than the last.',
  },
];

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="container">
          <div className="landing-nav-inner">
            <Link href="/" className="landing-brand">
              <div className="landing-brand-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span>AMPH</span>
              <span className="landing-pill">Training</span>
            </Link>
            <div className="landing-nav-links">
              <Link href="#features" className="landing-nav-link">Features</Link>
              <Link href="#how-it-works" className="landing-nav-link">How It Works</Link>
              <Link href="https://github.com/projectamazonph/Amazon-ad-console" target="_blank" rel="noopener noreferrer" className="landing-nav-link">GitHub</Link>
              <Link href="/auth/login" className="landing-nav-link landing-nav-link--ghost">Sign In</Link>
              <Link href="/dashboard" className="landing-cta-primary">Open Simulator</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <Image src="/hero_bg.webp" alt="" fill priority className="object-cover" />
        </div>
        <div className="landing-hero-overlay" />

        <div className="container landing-hero-content">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="landing-hero-label"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>No Amazon account needed</span>
          </motion.div>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="landing-hero-title"
          >
            Learn Amazon PPC<br />
            <span className="text-accent">without spending a cent</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="landing-hero-subtitle"
          >
            The only training simulator that feels exactly like the real Amazon Ads Console.
            Build campaigns. Run simulations. Practice optimization. Zero risk, zero ad spend.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="landing-hero-cta"
          >
            <Link href="/dashboard" className="landing-cta-primary landing-cta-primary--lg">
              Start Training Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="#how-it-works" className="landing-cta-ghost landing-cta-ghost--lg">
              See how it works
            </Link>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="landing-hero-note"
          >
            Runs entirely in your browser. No API. No credentials. Your data stays local.
          </motion.p>
        </div>
      </section>

      {/* Problem ΓåÆ Solution */}
      <section className="landing-problem">
        <div className="container">
          <div className="landing-problem-grid">
            <FadeIn className="landing-problem-col">
              <div className="landing-problem-label">The old way</div>
              <ul className="landing-problem-list">
                <li>Practice on live campaigns ΓÇö real money, real risk</li>
                <li>Learn by trial and expensive error</li>
                <li>No safe space to experiment with new strategies</li>
                <li>No guided coaching when you get stuck</li>
              </ul>
            </FadeIn>
            <FadeIn className="landing-problem-col landing-problem-col--accent" delay={0.1}>
              <div className="landing-problem-label">AMPH way</div>
              <ul className="landing-problem-list">
                <li>Build campaigns in a pixel-perfect replica</li>
                <li>Simulate 7 days of realistic performance</li>
                <li>Make every mistake in training, not in production</li>
                <li>Drills and missions with coaching built in</li>
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <div className="container">
          <FadeIn className="landing-section-header">
            <h2>Everything you need to go from zero to certified</h2>
            <p>Every tool from the real console. Practice until it&apos;s second nature.</p>
          </FadeIn>

          <div className="landing-features-grid">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.06} className="landing-feature-card">
                <div className="landing-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how" id="how-it-works">
        <div className="container">
          <FadeIn className="landing-section-header">
            <h2>Three steps to confident campaign management</h2>
            <p>No prior experience needed. Start from scratch, build real skills.</p>
          </FadeIn>

          <div className="landing-steps">
            <div className="landing-steps-line" />
            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.12} className="landing-step">
                <div className="landing-step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="landing-preview">
        <div className="container">
          <FadeIn className="landing-section-header">
            <h2>The exact interface you&apos;ll use in production</h2>
            <p>No simplified training wheels ΓÇö this is the real console experience.</p>
          </FadeIn>

          <FadeIn className="landing-preview-wrapper">
            <div className="landing-preview-header">
              <div className="landing-preview-dots">
                <div /><div /><div />
              </div>
              <span className="landing-preview-url">adconsole.app/dashboard</span>
            </div>
            <div className="landing-preview-content">
              <Image
                src="/dashboard-preview.webp"
                alt="Amazon Ads Console Simulator Dashboard"
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Band */}
      <section className="landing-cta-band">
        <div className="container">
          <FadeIn className="landing-cta-content">
            <h2>Stop learning by losing money.</h2>
            <p>Build your first campaign in the next 5 minutes.</p>
            <Link href="/dashboard" className="landing-cta-primary landing-cta-primary--lg landing-cta-primary--centered">
              Open the Simulator
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="landing-cta-note">Free. No account required. Runs in your browser.</p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer-inner">
            <div className="landing-footer-brand">
              <div className="landing-brand-icon landing-brand-icon--sm">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span>AMPH Training Simulator</span>
            </div>
            <div className="landing-footer-links">
              <a href="https://github.com/projectamazonph/Amazon-ad-console" target="_blank" rel="noopener noreferrer" className="landing-footer-link">GitHub</a>
              <a href="https://github.com/projectamazonph/Amazon-ad-console#features" target="_blank" rel="noopener noreferrer" className="landing-footer-link">Features</a>
            </div>
          </div>
          <p className="landing-footer-disclaimer">Not affiliated with Amazon. For training purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
