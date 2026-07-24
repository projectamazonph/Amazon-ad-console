'use client';

import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';

const CATEGORIES = [
  {
    title: 'Campaign Types',
    items: ['Sponsored Products', 'Sponsored Brands', 'Sponsored Display'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Targeting',
    items: ['Auto Targeting', 'Manual Keywords', 'Product Targeting'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Match Types',
    items: ['Exact Match', 'Phrase Match', 'Broad Match'],
    color: 'from-teal-500 to-teal-600',
  },
];

const FEATURES = [
  {
    title: 'Campaign Creation Wizard',
    description: 'Step-by-step guided setup for SP, SB, and SD campaigns matching the real Amazon Ads Console interface.',
    stat: '6 Steps',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Realistic Simulation Engine',
    description: 'Generate 7 days of performance data with realistic ROAS, ACOS, CPC, and conversion patterns.',
    stat: '7 Days',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: 'Search Term Mining',
    description: 'Analyze search terms by match type. Harvest winners and negate losers to optimize campaign performance.',
    stat: 'Auto-Mined',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    title: 'Budget & Bidding Strategies',
    description: 'Practice dynamic bid strategies, placement adjustments, and budget rule configuration without risk.',
    stat: 'Unlimited',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: 'Full Reporting Suite',
    description: 'Overview, search terms, placements, targets, and negatives — all tabs from the real console.',
    stat: 'All Tabs',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
  },
  {
    title: 'Zero API Required',
    description: 'Fully client-side. Train unlimited virtual assistants without Amazon credentials or API access.',
    stat: '100% Free',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
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

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#E3E6E6] text-[#0F1111] antialiased">
      {/* Top banner */}
      <div className="bg-[#232F3E] text-white text-center py-2 px-4 text-sm">
        <span className="font-medium">Amazon Ads Console Training Simulator</span>
        <span className="text-[#F3A847] ml-2">— Practice makes perfect</span>
      </div>

      {/* Header */}
      <header className="bg-[#232F3E] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[#F3A847] text-2xl font-bold italic">a</span>
              <span className="text-white text-xl font-bold tracking-tight">dConsole</span>
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex">
                <div className="relative flex-1 flex">
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
                  <button className="px-4 py-2 bg-[#FEBD69] hover:bg-[#F3A847] rounded-r-md border border-[#D5D9D9] border-l-0 transition-colors">
                    <svg className="w-4 h-4 text-[#0F1111]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-5">
              <Link href="/auth/login" className="text-white text-sm hover:underline">
                Sign in
              </Link>
              <Link href="/auth/register" className="text-white text-sm hover:underline">
                Register
              </Link>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-4 py-2 bg-[#F3A847] hover:bg-[#E5A043] text-[#0F1111] text-sm font-medium rounded-md transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Category bar */}
      <div className="bg-[#232F3E] border-t border-[#3A4553]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 h-10 text-sm text-white overflow-x-auto scrollbar-hide">
            <Link href="#" className="hover:underline whitespace-nowrap flex-shrink-0">Deals</Link>
            <Link href="#" className="hover:underline whitespace-nowrap flex-shrink-0">Campaigns</Link>
            <Link href="#" className="hover:underline whitespace-nowrap flex-shrink-0">Reports</Link>
            <Link href="#" className="hover:underline whitespace-nowrap flex-shrink-0">Bulk Operations</Link>
            <Link href="#" className="hover:underline whitespace-nowrap flex-shrink-0">Drills</Link>
            <Link href="#" className="hover:underline whitespace-nowrap flex-shrink-0">Trainer</Link>
            <Link href="#" className="hover:underline whitespace-nowrap flex-shrink-0">Missions</Link>
            <span className="text-[#F3A847] whitespace-nowrap flex-shrink-0">Free • No API needed</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#E3E6E6] via-[#E3E6E6] to-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="flex-1"
            >
              <div className="inline-flex items-center gap-2 bg-[#F3A847] text-[#0F1111] text-xs font-bold px-3 py-1 rounded-full mb-4">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Training Simulator
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
                Master Amazon Ads
                <span className="block text-[#E7760E]">without spending a penny</span>
              </h1>
              <p className="text-[#565959] text-lg mb-6 leading-relaxed">
                A pixel-perfect replica of the Amazon Ads Console. Create campaigns, 
                run simulations, and practice optimization — all without a live account or API access.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#E7760E] hover:bg-[#E87510] text-white font-bold rounded-md text-sm transition-colors shadow-sm"
                >
                  Start Training Free
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <a 
                  href="https://github.com/projectamazonph/Amazon-ad-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[#D5D9D9] bg-white hover:bg-[#F0F2F2] text-[#0F1111] font-medium rounded-md text-sm transition-colors"
                >
                  View on GitHub
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              className="flex-1 w-full"
            >
              <div className="bg-white rounded-lg border border-[#D5D9D9] shadow-lg overflow-hidden">
                {/* Fake dashboard header */}
                <div className="bg-[#F3F3F3] border-b border-[#D5D9D9] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ED6A5F]" />
                      <div className="w-3 h-3 rounded-full bg-[#F4BF4F]" />
                      <div className="w-3 h-3 rounded-full bg-[#61C454]" />
                    </div>
                    <div className="flex-1 bg-white border border-[#D5D9D9] rounded px-3 py-1 text-xs text-[#565959]">
                      adconsole.app/dashboard
                    </div>
                  </div>
                </div>
                {/* Fake dashboard content */}
                <div className="p-5">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {['Impressions', 'Clicks', 'Spend', 'Orders'].map((metric) => (
                      <div key={metric} className="bg-[#F6F6F6] border border-[#D5D9D9] rounded p-3">
                        <div className="text-xs text-[#565959] mb-1">{metric}</div>
                        <div className="text-sm font-bold text-[#0F1111]">
                          {metric === 'Impressions' ? '12.4K' : 
                           metric === 'Clicks' ? '847' : 
                           metric === 'Spend' ? '$234' : '23'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[#232F3E] rounded-full" style={{width: '100%'}} />
                    <div className="h-2 bg-[#E7760E] rounded-full" style={{width: '75%'}} />
                    <div className="h-2 bg-[#F3A847] rounded-full" style={{width: '60%'}} />
                    <div className="h-2 bg-[#D4D9D9] rounded-full" style={{width: '45%'}} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-[#007185]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Live simulation data
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories ribbon */}
      <section className="bg-white border-y border-[#D5D9D9] py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 text-sm overflow-x-auto scrollbar-hide">
            <span className="text-[#565959] font-medium flex-shrink-0">Campaign types:</span>
            {CATEGORIES.map((cat) => (
              <div key={cat.title} className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${cat.color}`} />
                <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                  {cat.title}
                </span>
              </div>
            ))}
            <span className="text-[#565959] flex-shrink-0">+ more</span>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-[#E3E6E6] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-[#0F1111]">What&apos;s inside the simulator</h2>
            <p className="text-[#565959] mt-1">Everything from the real Amazon Ads Console — minus the API</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
                className="group bg-white border border-[#D5D9D9] rounded-lg p-6 hover:border-[#E7760E] hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {/* Icon row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#F6F6F6] group-hover:bg-[#F3A847]/10 border border-[#D5D9D9] group-hover:border-[#F3A847]/30 rounded-lg flex items-center justify-center text-[#565959] group-hover:text-[#E7760E] transition-all duration-300">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-bold text-[#007185] bg-[#E3E6E6] px-2 py-1 rounded">
                    {feature.stat}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0F1111] mb-2 group-hover:text-[#C7511F] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#565959] leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#007185] group-hover:text-[#C7511F] transition-colors">
                  Learn more
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-[#D5D9D9] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold text-[#0F1111]">How it works</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.32, 0.72, 0, 1] }}
                className="relative bg-[#FAFAFA] border border-[#D5D9D9] rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 bg-[#F3A847] text-[#0F1111] font-bold text-lg rounded-full flex items-center justify-center mb-4">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-[#0F1111] mb-2">{step.title}</h3>
                <p className="text-sm text-[#565959] leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-[#232F3E] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to train your team?
            </h2>
            <p className="text-[#D4D9D9] mb-6 text-sm md:text-base">
              No Amazon account required. No API. No risk. Just pure learning.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#F3A847] hover:bg-[#E5A043] text-[#0F1111] font-bold rounded-md text-sm transition-colors shadow-sm"
            >
              Open the Simulator
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#232F3E] border-t border-[#3A4553]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#D4D9D9]">
            <div className="flex items-center gap-2">
              <span className="text-[#F3A847] text-lg font-bold italic">a</span>
              <span className="text-white font-bold">dConsole</span>
              <span className="text-[#D4D9D9]">Training Simulator</span>
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="https://github.com/projectamazonph/Amazon-ad-console"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline"
              >
                GitHub
              </a>
              <span>Not affiliated with Amazon.com</span>
            </div>
          </div>
        </div>
        <div className="bg-[#131921] py-3 text-center">
          <p className="text-xs text-[#565959]">
            This is a training simulator. Not affiliated with Amazon or Amazon Advertising.
          </p>
        </div>
      </footer>
    </div>
  );
}
