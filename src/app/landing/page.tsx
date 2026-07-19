'use client';

import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';

const FEATURES = [
  {
    title: 'SP, SB, SD Campaigns',
    description: 'Full campaign creation wizard matching the real Amazon Ads Console. Sponsored Products, Brands, and Display.',
    icon: '📊',
  },
  {
    title: 'Realistic Simulation',
    description: '7-day performance simulation with ROAS, ACOS, CPC, and search term generation based on match types.',
    icon: '⚡',
  },
  {
    title: 'Targeting Training',
    description: 'Automatic, manual keyword, and product targeting. Exact, phrase, and broad match types with search term harvesting.',
    icon: '🎯',
  },
  {
    title: 'Budget & Bidding',
    description: 'Dynamic bid strategies, placement adjustments, and budget rules. Train bid optimization decisions.',
    icon: '💰',
  },
  {
    title: 'Search Term Mining',
    description: 'Generate and analyze search terms. Identify winners to harvest and losers to negate.',
    icon: '🔍',
  },
  {
    title: 'No API Required',
    description: 'Pure client-side simulator. No Amazon API access needed. Train unlimited VAs without API costs.',
    icon: '🚀',
  },
];

const STATS = [
  { value: '239+', label: 'Unit Tests' },
  { value: '3', label: 'Campaign Types' },
  { value: '0', label: 'API Calls' },
  { value: '100%', label: 'Client-Side' },
];

export default function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">AdConsole</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Training</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Sign up
            </Link>
            <Link
              href="/"
              className="bg-white text-zinc-950 px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Launch Simulator
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Amazon PPC Training</div>
              <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1] mb-6">
                Train your team on the real Amazon Ads Console
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-8">
                A pixel-perfect replica of Amazon&apos;s advertising platform. 
                Create campaigns, optimize bids, and mine search terms without touching a live account.
              </p>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/"
                className="bg-white text-zinc-950 px-8 py-3.5 rounded-full text-base font-medium hover:bg-zinc-200 transition-colors"
              >
                Start Training
              </Link>
              <a
                href="https://github.com/projectamazonph/Amazon-ad-console"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 text-white border border-white/10 px-8 py-3.5 rounded-full text-base font-medium hover:bg-white/10 transition-colors"
              >
                View Source
              </a>
            </motion.div>
          </div>

          {/* Stats Strip */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-10"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
                <div className="text-zinc-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900"
          >
            {/* Mock Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-zinc-700/50 rounded-lg px-4 py-1.5 text-xs text-zinc-400 max-w-md mx-auto text-center">
                  adconsole.training
                </div>
              </div>
            </div>
            {/* Mock App Content */}
            <div className="aspect-[16/9] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center p-8">
              <div className="grid grid-cols-4 gap-4 w-full max-w-4xl">
                {/* Mock Dashboard Cards */}
                <div className="col-span-4 grid grid-cols-4 gap-4">
                  <div className="bg-zinc-700/50 rounded-xl p-4">
                    <div className="text-zinc-400 text-xs mb-1">Impressions</div>
                    <div className="text-2xl font-semibold">124.5K</div>
                  </div>
                  <div className="bg-zinc-700/50 rounded-xl p-4">
                    <div className="text-zinc-400 text-xs mb-1">Clicks</div>
                    <div className="text-2xl font-semibold">3,847</div>
                  </div>
                  <div className="bg-zinc-700/50 rounded-xl p-4">
                    <div className="text-zinc-400 text-xs mb-1">Spend</div>
                    <div className="text-2xl font-semibold">$2,847</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="text-emerald-400 text-xs mb-1">ROAS</div>
                    <div className="text-2xl font-semibold text-emerald-400">4.2x</div>
                  </div>
                </div>
                {/* Mock Campaign List */}
                <div className="col-span-4 bg-zinc-700/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs">SP</span>
                      <span className="font-medium">Coffee Filter | Auto | Discovery</span>
                    </div>
                    <span className="text-zinc-400">$35/day</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">SB</span>
                      <span className="font-medium">Brand Collection | Exact Winners</span>
                    </div>
                    <span className="text-zinc-400">$55/day</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs">SD</span>
                      <span className="font-medium">Remarketing | Views | 30-day</span>
                    </div>
                    <span className="text-zinc-400">$40/day</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Everything you need to train PPC VAs</h2>
            <p className="text-zinc-400 max-w-xl text-lg">
              Built from the ground up to replicate the Amazon advertising experience.
            </p>
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
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Start training in 3 steps</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Create a campaign',
                description: 'Walk through the 6-step wizard. Choose SP, SB, or SD. Set targeting, bidding, and creative.',
              },
              {
                step: '02',
                title: 'Run simulations',
                description: 'Generate 7 days of realistic performance data. Watch impressions, clicks, and sales accumulate.',
              },
              {
                step: '03',
                title: 'Optimize and learn',
                description: 'Mine search terms. Harvest winners. Add negatives. Train the optimization loop.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-5xl font-semibold text-white/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 rounded-3xl p-12 md:p-16 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
              Ready to train your team?
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
              No API access required. No live account risk. Just pure training on a realistic Amazon Ads replica.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-zinc-950 px-10 py-4 rounded-full text-base font-medium hover:bg-zinc-200 transition-colors"
            >
              Launch Simulator
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500 text-sm">Not affiliated with Amazon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
