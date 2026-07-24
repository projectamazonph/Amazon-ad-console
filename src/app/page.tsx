'use client';

import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';

const FEATURES = [
  {
    title: 'SP, SB, SD campaigns',
    description: 'Full creation wizard matching the real Amazon Ads Console. Sponsored Products, Brands, and Display.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3z" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
  },
  {
    title: 'Realistic simulation',
    description: '7-day performance data with ROAS, ACOS, CPC, and search term generation per match type.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: 'Targeting training',
    description: 'Automatic, manual keyword, and product targeting. Exact, phrase, and broad match types.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: 'Budget and bidding',
    description: 'Dynamic bid strategies, placement adjustments, and budget rules.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: 'Search term mining',
    description: 'Generate and analyze search terms. Identify winners to harvest and losers to negate.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    title: 'No API required',
    description: 'Pure client-side simulator. No Amazon API access needed. Train unlimited VAs.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Create a campaign',
    description: 'Walk through the 6-step wizard. Choose SP, SB, or SD. Set targeting, bidding, and creative.',
  },
  {
    num: '02',
    title: 'Run simulations',
    description: 'Generate 7 days of realistic performance data. Watch impressions, clicks, and sales accumulate.',
  },
  {
    num: '03',
    title: 'Optimize and learn',
    description: 'Mine search terms. Harvest winners. Add negatives. Train the optimization loop.',
  },
];

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden antialiased">
      {/* Ambient mesh gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-violet-500/[0.04] rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-cyan-500/[0.02] rounded-full blur-[80px]" />
      </div>

      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-50" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} 
      />

      {/* Floating glass pill navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-max">
        <div className="relative">
          {/* Outer shell */}
          <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-full ring-1 ring-white/[0.08] shadow-2xl shadow-black/50">
            <div className="flex items-center gap-1 px-2 py-2">
              <div className="flex items-center gap-3 px-4 py-2">
                <span className="text-sm font-medium tracking-tight">AdConsole</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                  Training
                </span>
              </div>
              <div className="w-px h-5 bg-white/10 mx-2" />
              <div className="flex items-center gap-1 pr-2">
                <Link 
                  href="/auth/login" 
                  className="px-3 py-2 text-xs text-white/60 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-full hover:bg-white/[0.05]"
                >
                  Sign in
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-3 py-2 text-xs text-white/60 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-full hover:bg-white/[0.05]"
                >
                  Sign up
                </Link>
                <Link 
                  href="/dashboard" 
                  className="group relative ml-1 px-4 py-2 bg-white text-zinc-950 text-xs font-medium rounded-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[0.98] active:scale-[0.97]"
                >
                  <span className="relative z-10">Open simulator</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="relative min-h-[100dvh] flex items-center pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-4xl">
            {/* Eyebrow tag */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                Amazon Ads Console Training
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 30, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.95] mb-8"
            >
              <span className="block">Train your team</span>
              <span className="block bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                on the real
              </span>
              <span className="block text-white/30">Amazon Ads Console</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="text-lg md:text-xl text-white/50 max-w-xl leading-relaxed mb-12"
            >
              A replica of Amazon&apos;s advertising platform. Create campaigns, optimize bids, 
              and mine search terms without touching a live account.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link 
                href="/dashboard" 
                className="group relative inline-flex items-center gap-3 px-6 py-3.5 bg-white text-zinc-950 rounded-full font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Open simulator</span>
                {/* Button-in-button icon */}
                <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-zinc-950 text-white group-hover:bg-zinc-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>

              <a 
                href="https://github.com/projectamazonph/Amazon-ad-console"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full ring-1 ring-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <span>View source</span>
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </section>

      {/* Features section with Bento Grid */}
      <section className="relative py-32 md:py-48 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="mb-16 md:mb-24"
          >
            <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              Everything you need
            </h2>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={reduce ? false : { opacity: 0, y: 40, filter: 'blur(12px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
                className="group relative"
              >
                {/* Double-Bezel outer shell */}
                <div className="relative bg-white/[0.02] rounded-[1.5rem] p-px ring-1 ring-white/[0.06]">
                  {/* Inner core */}
                  <div className="relative bg-[#0a0a0a] rounded-[calc(1.5rem-1px)] p-6 md:p-8 h-full overflow-hidden">
                    {/* Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
                    
                    {/* Icon */}
                    <div className="relative w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-6 text-emerald-400/80 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      {feature.icon}
                    </div>

                    {/* Content */}
                    <h3 className="relative text-lg font-medium mb-3 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="relative text-sm text-white/40 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="relative py-32 md:py-48 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="mb-16 md:mb-24"
          >
            <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 font-medium mb-4">
              Process
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              How it works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={reduce ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.32, 0.72, 0, 1] }}
                className="relative group"
              >
                {/* Step number */}
                <div className="text-[80px] lg:text-[100px] font-semibold tracking-tight leading-none text-white/[0.03] absolute -top-8 -left-2 select-none">
                  {step.num}
                </div>

                {/* Content */}
                <div className="relative pt-12">
                  <h3 className="text-xl md:text-2xl font-medium mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-white/40 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-6 w-8 lg:w-12 h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA section */}
      <section className="relative py-32 md:py-48 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          >
            <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 font-medium mb-6">
              Get started
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6">
              Ready to train
              <span className="block text-white/20">your team?</span>
            </h2>
            <p className="text-lg text-white/40 mb-12 max-w-lg mx-auto">
              No API access required. No live account risk. Just pure, hands-on learning.
            </p>

            <Link 
              href="/dashboard" 
              className="group relative inline-flex items-center gap-4 px-8 py-4 bg-white text-zinc-950 rounded-full font-medium text-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Open simulator</span>
              <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-zinc-950 text-white group-hover:bg-zinc-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Bottom gradient accent */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium tracking-tight">AdConsole</span>
            <span className="text-xs text-white/30">Training Simulator</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <a 
              href="https://github.com/projectamazonph/Amazon-ad-console"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors duration-300"
            >
              GitHub
            </a>
            <span>Not affiliated with Amazon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
