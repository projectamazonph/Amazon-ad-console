import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PPC Coach",
  description:
    "Amazon PPC teaching companion — 12 modules, glossary, search-term trainer, campaign builder, report builder, quiz arena, AI coach, and a teacher cohort view.",
};

export default function CoachPage() {
  return (
    <div className="flex h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      <div className="z-20 flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <span aria-hidden>←</span> Back to home
        </Link>
        <span className="font-display text-xs font-bold tracking-widest text-amber-600 uppercase">
          PPC Coach
        </span>
        <span className="text-xs text-zinc-400">Amazon PPC Teaching Companion</span>
        <a
          href="/ppc-coach.html"
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-xs font-semibold text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Open in new tab ↗
        </a>
      </div>
      <iframe
        src="/ppc-coach.html"
        title="PPC Coach — Amazon PPC Teaching Companion"
        className="flex-1 w-full border-0"
        // Legacy HTML is fully self-contained: forms (for localStorage state),
        // scripts (CDN tailwind/chart.js), same-origin. No top-nav, no popups.
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="eager"
      />
    </div>
  );
}
