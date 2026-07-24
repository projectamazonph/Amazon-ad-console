'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ListChecks,
  ChartLine,
  MagnifyingGlass,
  CurrencyDollar,
  Files,
  Lock,
  ArrowRight,
} from '@phosphor-icons/react';

const FEATURES = [
  {
    title: 'Campaign Creation Wizard',
    description: 'Step-by-step guided setup for SP, SB, and SD campaigns matching the real Amazon Ads Console interface.',
    stat: '6 Steps',
    icon: <ListChecks size={24} weight="duotone" />,
  },
  {
    title: 'Realistic Simulation',
    description: 'Generate 7 days of performance data with realistic ROAS, ACOS, CPC, and conversion patterns.',
    stat: '7 Days',
    icon: <ChartLine size={24} weight="duotone" />,
  },
  {
    title: 'Search Term Mining',
    description: 'Analyze search terms by match type. Harvest winners and negate losers to optimize performance.',
    stat: 'Auto-Mined',
    icon: <MagnifyingGlass size={24} weight="duotone" />,
  },
  {
    title: 'Budget and Bidding',
    description: 'Practice dynamic bid strategies, placement adjustments, and budget rules without risk.',
    stat: 'Unlimited',
    icon: <CurrencyDollar size={24} weight="duotone" />,
  },
  {
    title: 'Full Reporting Suite',
    description: 'Overview, search terms, placements, targets, and negatives - all tabs from the real console.',
    stat: 'All Tabs',
    icon: <Files size={24} weight="duotone" />,
  },
  {
    title: 'Zero API Required',
    description: 'Fully client-side. Train unlimited virtual assistants without Amazon credentials.',
    stat: '100% Free',
    icon: <Lock size={24} weight="duotone" />,
  },
];

const STEPS = [
  {
    num: '1',
    title: 'Create your campaign',
    description: 'Walk through the 6-step wizard. Choose campaign type, set targeting, bidding, and creative.',
  },
  {
    num: '2',
    title: 'Run a simulation',
    description: 'Generate realistic 7-day performance data. Watch metrics build up like a real campaign.',
  },
  {
    num: '3',
    title: 'Optimize and iterate',
    description: 'Mine search terms, adjust bids, add negatives. Practice the full optimization loop.',
  },
];

function RevealCard({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#E3E6E6] text-[#0F1111] antialiased">
      {/* Top Banner */}
      <div className="bg-[#232F3E] text-white text-center py-2 px-4 text-sm">
        <span className="font-medium">Amazon Ads Console Training Simulator</span>
        <span className="text-[#F3A847] ml-2">Practice makes perfect</span>
      </div>

      {/* Header */}
      <header className="bg-[#232F3E] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 md:gap-6 h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 flex-shrink-0 group">
              <span className="text-[#F3A847] text-2xl font-bold italic transition-transform group-hover:scale-110">a</span>
              <span className="text-white text-xl font-bold tracking-tight">dConsole</span>
            </Link>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="flex w-full">
                <select className="bg-[#E3E6E6] text-[#0F1111] text-sm px-3 py-2 rounded-l-md border border-[#D5D9D9] border-r-0 focus:outline-none focus:ring-2 focus:ring-[#F3A847] cursor-pointer">
                  <option>All</option>
                  <option>Campaigns</option>
                  <option>Features</option>
                </select>
                <input
                  type="text"
                  placeholder="Search features..."
                  className="flex-1 px-3 py-2 text-sm border border-[#D5D9D9] focus:outline-none focus:ring-2 focus:ring-[#F3A847]"
                />
                <button className="px-4 py-2 bg-[#F3A847] hover:bg-[#E7760E] rounded-r-md border border-[#D5D9D9] border-l-0 transition-colors">
                  <svg className="w-4 h-4 text-[#0F1111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex items-center gap-3 md:gap-5 ml-auto">
              <Link href="/auth/login" className="text-white text-sm hover:text-[#F3A847] transition-colors hidden sm:block">Sign in</Link>
              <Link href="/auth/register" className="text-white text-sm hover:text-[#F3A847] transition-colors hidden sm:block">Register</Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-[#F3A847] hover:bg-[#E7760E] text-[#0F1111] text-sm font-bold rounded-md transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Category Nav */}
      <div className="bg-[#232F3E] border-t border-[#3A4553]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 md:gap-6 h-10 text-sm text-white overflow-x-auto">
            <Link href="#" className="hover:text-[#F3A847] whitespace-nowrap flex-shrink-0 transition-colors">Deals</Link>
            <Link href="#" className="hover:text-[#F3A847] whitespace-nowrap flex-shrink-0 transition-colors">Campaigns</Link>
            <Link href="#" className="hover:text-[#F3A847] whitespace-nowrap flex-shrink-0 transition-colors">Reports</Link>
            <Link href="#" className="hover:text-[#F3A847] whitespace-nowrap flex-shrink-0 transition-colors">Bulk Ops</Link>
            <Link href="#" className="hover:text-[#F3A847] whitespace-nowrap flex-shrink-0 transition-colors">Drills</Link>
            <Link href="#" className="hover:text-[#F3A847] whitespace-nowrap flex-shrink-0 transition-colors">Trainer</Link>
            <Link href="#" className="hover:text-[#F3A847] whitespace-nowrap flex-shrink-0 transition-colors">Missions</Link>
            <span className="text-[#F3A847] whitespace-nowrap flex-shrink-0 font-medium">Free. No API</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#E3E6E6] to-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left: Copy */}
            <div className="flex-1">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-flex items-center gap-2 bg-[#F3A847]/10 text-[#E7760E] text-xs font-bold px-3 py-1 rounded-full mb-4">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Training Simulator
                </span>
              </motion.div>

              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4"
              >
                Master Amazon Ads
                <span className="block text-[#E7760E]">without spending a penny</span>
              </motion.h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#565959] text-lg mb-8 leading-relaxed max-w-xl"
              >
                A pixel-perfect replica of the Amazon Ads Console. Create campaigns,
                run simulations, and practice optimization - all without a live account.
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#F3A847] hover:bg-[#E7760E] text-white font-bold rounded-md text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  Start Training Free
                  <ArrowRight size={16} weight="bold" />
                </Link>
                <a
                  href="https://github.com/projectamazonph/Amazon-ad-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#D5D9D9] bg-white hover:bg-gray-50 text-[#0F1111] font-medium rounded-md text-sm transition-all hover:border-[#F3A847]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  View on GitHub
                </a>
              </motion.div>
            </div>

            {/* Right: Real Dashboard Preview */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full"
            >
              <div className="bg-white rounded-xl border-2 border-[#D5D9D9] shadow-2xl overflow-hidden">
                {/* Browser Chrome */}
                <div className="bg-gray-100 border-b border-[#D5D9D9] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white border border-[#D5D9D9] rounded-md px-3 py-1 text-xs text-[#565959] flex items-center gap-2">
                      <svg className="w-3 h-3 text-[#007185]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      adconsole.app/dashboard
                    </div>
                  </div>
                </div>

                {/* Real dashboard screenshot */}
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src="/dashboard-preview.png"
                    alt="Amazon Ads Console dashboard preview"
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

      {/* Category Ribbon */}
      <section className="bg-white border-y border-[#D5D9D9] py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 text-sm overflow-x-auto">
            <span className="text-[#565959] font-medium flex-shrink-0">Campaign types:</span>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#F3A847]" />
                <span className="text-[#007185] hover:text-[#E7760E] cursor-pointer transition-colors">Sponsored Products</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#0073BB]" />
                <span className="text-[#007185] hover:text-[#E7760E] cursor-pointer transition-colors">Sponsored Brands</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#00A8E1]" />
                <span className="text-[#007185] hover:text-[#E7760E] cursor-pointer transition-colors">Sponsored Display</span>
              </div>
            </div>
            <span className="text-[#565959] flex-shrink-0">and more</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#E3E6E6] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <RevealCard className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F1111] mb-2">What&apos;s inside the simulator</h2>
            <p className="text-[#565959]">Everything from the real Amazon Ads Console. Minus the API.</p>
          </RevealCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <RevealCard key={feature.title} delay={i * 0.06} className="group bg-white border-2 border-[#D5D9D9] rounded-xl p-6 hover:border-[#F3A847] hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-50 group-hover:bg-[#F3A847]/10 border border-[#D5D9D9] group-hover:border-[#F3A847]/30 rounded-xl flex items-center justify-center text-[#565959] group-hover:text-[#F3A847] transition-all">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-bold text-[#007185] bg-gray-100 px-2 py-1 rounded">{feature.stat}</span>
                </div>
                <h3 className="text-base font-bold text-[#0F1111] mb-2 group-hover:text-[#E7760E] transition-colors">{feature.title}</h3>
                <p className="text-sm text-[#565959] leading-relaxed mb-4">{feature.description}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-[#007185] group-hover:text-[#E7760E] transition-colors">
                  Learn more
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-[#D5D9D9] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <RevealCard className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F1111]">How it works</h2>
          </RevealCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <RevealCard key={step.num} delay={i * 0.1} className="relative bg-gray-50 border border-[#D5D9D9] rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#F3A847] text-white font-bold text-xl rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#F3A847]/30">{step.num}</div>
                <h3 className="text-base font-bold text-[#0F1111] mb-2">{step.title}</h3>
                <p className="text-sm text-[#565959] leading-relaxed">{step.description}</p>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="bg-[#232F3E] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <RevealCard>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Ready to train your team?</h2>
            <p className="text-gray-300 mb-8 text-base md:text-lg">No Amazon account required. No API. No risk. Just pure learning.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#F3A847] hover:bg-[#E7760E] text-white font-bold rounded-lg text-base transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Open the Simulator
              <ArrowRight size={18} weight="bold" />
            </Link>
          </RevealCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#232F3E] border-t border-[#3A4553]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#F3A847] text-xl font-bold italic">a</span>
              <span className="text-white font-bold text-lg">dConsole</span>
              <span className="text-gray-400 text-sm">Training Simulator</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="https://github.com/projectamazonph/Amazon-ad-console" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
              <span className="text-gray-500">|</span>
              <span className="text-gray-500 text-xs">Not affiliated with Amazon.com</span>
            </div>
          </div>
        </div>
        <div className="bg-[#131921] py-3 text-center">
          <p className="text-xs text-gray-500">This is a training simulator. Not affiliated with Amazon or Amazon Advertising.</p>
        </div>
      </footer>
    </div>
  );
}
