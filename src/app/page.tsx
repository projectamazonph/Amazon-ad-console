'use client';

import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';

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

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">AdConsole</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Training</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
              Sign in
            </Link>
            <Link href="/auth/register" className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
              Sign up
            </Link>
            <Link href="/dashboard" className="bg-white text-zinc-950 px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">
              Open simulator
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1] mb-6">
                Train your team on the real Amazon Ads Console
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-8">
                A replica of Amazon&apos;s advertising platform. Create campaigns, optimize bids, and mine search terms without touching a live account.
              </p>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/dashboard" className="bg-white text-zinc-950 px-8 py-3.5 rounded-full text-base font-medium hover:bg-zinc-200 transition-colors">
                Open simulator
              </Link>
              <a
                href="https://github.com/projectamazonph/Amazon-ad-console"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 text-white border border-white/10 px-8 py-3.5 rounded-full text-base font-medium hover:bg-white/10 transition-colors"
              >
                View source
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">What you get</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">How it works</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Create a campaign',
                description: 'Walk through the 6-step wizard. Choose SP, SB, or SD. Set targeting, bidding, and creative.',
              },
              {
                title: 'Run simulations',
                description: 'Generate 7 days of realistic performance data. Watch impressions, clicks, and sales accumulate.',
              },
              {
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
              >
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
              Ready to train your team?
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
              No API access required. No live account risk.
            </p>
            <Link href="/dashboard" className="inline-block bg-white text-zinc-950 px-10 py-4 rounded-full text-base font-medium hover:bg-zinc-200 transition-colors">
              Open simulator
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-zinc-500 text-sm">
            Amazon Ad Console Training Simulator
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/projectamazonph/Amazon-ad-console"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              GitHub
            </a>
            <span className="text-zinc-500 text-sm">Not affiliated with Amazon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
