import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Downloads" };

type Download = {
  filename: string;
  href: string;
  size: string;
  kind: "html" | "markdown" | "zip";
  what: string;
};

const DOWNLOADS: Download[] = [
  {
    filename: "PPC Coach — full app (offline HTML)",
    href: "/downloads/ppc-coach-offline.html",
    size: "~113 KB",
    kind: "html",
    what: "The entire teaching companion in one self-contained HTML file. Open it directly in any browser — works offline once CDN fonts and chart.js have loaded once.",
  },
  {
    filename: "PPC Coach — source archive (.zip)",
    href: "/downloads/ppc-coach-source.zip",
    size: "~35 KB",
    kind: "zip",
    what: "The same offline HTML, zipped. Useful for emailing to a student or uploading to a classroom drive.",
  },
  {
    filename: "AdConsole Pro — legacy simulator (offline HTML)",
    href: "/adconsole.html",
    size: "~161 KB",
    kind: "html",
    what: "The original teaching simulator. The page that started this whole product line.",
  },
  {
    filename: "VA Starter Kit",
    href: "/downloads/va-starter-kit.md",
    size: "~3 KB",
    kind: "markdown",
    what: "A copy-paste onboarding checklist: what to ask your manager on day one, what to read in week one, what to have ready by week four.",
  },
  {
    filename: "4-Week New Product Launch Plan",
    href: "/downloads/4-week-launch-plan.md",
    size: "~3 KB",
    kind: "markdown",
    what: "The week-by-week launch plan from Module 6, in printable markdown. Hand this to a client as a one-pager.",
  },
  {
    filename: "Printable Handouts (all 8 in one page)",
    href: "/learn/handouts",
    size: "—",
    kind: "html",
    what: "All eight cheat sheets on one route. Print to PDF (Ctrl+P → Save as PDF) for a single multi-page handout pack.",
  },
];

const KIND_ICON: Record<Download["kind"], string> = {
  html: "🌐",
  markdown: "📄",
  zip: "📦",
};

const KIND_LABEL: Record<Download["kind"], string> = {
  html: "HTML",
  markdown: "Markdown",
  zip: "Zip",
};

export default function DownloadsPage() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">
          Downloads
        </p>
        <h1 className="font-display text-3xl font-bold text-zinc-900">
          Take it with you
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          Everything you need to operate offline — the full app, the launch
          plan, the starter kit, and a printable handout pack. Click any file
          to download or open it in a new tab.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-2">
        <ul className="divide-y divide-zinc-200">
          {DOWNLOADS.map((d) => (
            <li key={d.href} className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="text-2xl" aria-hidden>
                  {KIND_ICON[d.kind]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h2 className="font-display text-base font-bold text-zinc-900">
                      {d.filename}
                    </h2>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 uppercase">
                      {KIND_LABEL[d.kind]}
                    </span>
                    <span className="text-xs text-zinc-400">{d.size}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">{d.what}</p>
                </div>
                <a
                  href={d.href}
                  download={d.kind !== "html"}
                  target={d.kind === "html" ? "_blank" : undefined}
                  rel={d.kind === "html" ? "noreferrer" : undefined}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-900 transition hover:bg-amber-400"
                >
                  {d.kind === "html" ? "Open" : "Download"} <span aria-hidden>↓</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-display text-lg font-bold text-amber-900">
          How to print anything to PDF
        </h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-amber-900">
          <li>Open the page you want (a handout, the guide, the report preview).</li>
          <li>
            Press <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd>+<kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">P</kbd> (or <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">⌘</kbd>+<kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">P</kbd> on Mac).
          </li>
          <li>In the print dialog, change the destination to <b>“Save as PDF”</b>.</li>
          <li>Click Save. The file lands wherever your browser saves downloads.</li>
        </ol>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-zinc-900">
          Going fully offline
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          The full app is a single HTML file that uses CDN fonts and
          Chart.js. To use it without internet:
        </p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-zinc-700">
          <li>Open <Link href="/ppc-coach.html" className="font-semibold text-amber-700 underline">/ppc-coach.html</Link> once while online — your browser will cache the CDN assets.</li>
          <li>Bookmark the file or save it locally.</li>
          <li>Use it on the plane, in a cafe with bad wifi, or in a client&apos;s office where the network is locked down.</li>
        </ol>
        <p className="mt-3 text-xs text-zinc-500">
          All progress is stored in <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">localStorage</code>{" "}
          under the key <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">ppcCoachState_v2</code>{" "}
          — it travels with the browser, not the file.
        </p>
      </section>
    </article>
  );
}
