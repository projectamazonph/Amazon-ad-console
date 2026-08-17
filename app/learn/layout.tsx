import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "./_components/Sidebar";

export const metadata: Metadata = {
  title: {
    default: "Learn",
    template: "%s · Learn · AdConsole",
  },
  description:
    "Documentation, student guide, printable handouts, and downloadable resources for the PPC Coach teaching companion.",
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="print:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          <span aria-hidden>←</span> Home
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xs font-bold tracking-widest text-amber-600 uppercase">
            PPC Coach
          </span>
          <span className="text-xs text-zinc-400">Documentation</span>
        </div>
        <Link
          href="/coach"
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-900 transition hover:bg-amber-400"
        >
          Launch app <span aria-hidden>↗</span>
        </Link>
      </header>
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto max-w-3xl print:max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
