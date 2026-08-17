import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";

export const metadata: Metadata = {
  title: "AdConsole",
  description: "Amazon PPC teaching simulator",
};

async function getFileStats(filename: string) {
  try {
    const filePath = path.join(process.cwd(), "public", filename);
    const stat = await fs.stat(filePath);
    return {
      bytes: stat.size,
      kb: Math.round(stat.size / 1024),
      modified: stat.mtime.toLocaleString("sv-SE"),
    };
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`${filename} not found:`, e);
    }
    return null;
  }
}

const getLegacyStats = () => getFileStats("adconsole.html");
const getCoachStats = () => getFileStats("ppc-coach.html");

export default async function Home() {
  const [stats, coachStats] = await Promise.all([getLegacyStats(), getCoachStats()]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-stretch justify-center gap-10 px-6 py-16 sm:px-10">
        <header className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Next.js shell ready
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            AdConsole
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Amazon PPC teaching simulator + companion apps. Two legacy static
            pages live in <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-900">public/</code>{" "}
            while we port everything into React components. Pick a path below to
            keep moving.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/adconsole.html"
            className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                AdConsole Simulator
              </h2>
              <span className="text-zinc-400 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              The original teaching simulator. Practice campaign management in
              a sandbox — works exactly as before, no rebuild required.
            </p>
            {stats && (
              <dl className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-900">
                <div>
                  <dt className="font-medium text-zinc-400">Size</dt>
                  <dd className="text-zinc-700 dark:text-zinc-300">
                    {stats.kb} KB
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-400">Last modified</dt>
                  <dd className="text-zinc-700 dark:text-zinc-300">
                    {stats.modified}
                  </dd>
                </div>
              </dl>
            )}
          </a>

          <a
            href="/coach"
            className="group flex flex-col gap-3 rounded-2xl border border-amber-200 bg-white p-6 transition-all hover:border-amber-300 hover:shadow-sm dark:border-amber-900/40 dark:bg-zinc-950 dark:hover:border-amber-800"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                PPC Coach{" "}
                <span className="ml-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:bg-amber-900/40 dark:text-amber-300">
                  Companion
                </span>
              </h2>
              <span className="text-zinc-400 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              12 plain-words modules, glossary, search-term trainer, campaign
              builder, report builder, quiz arena, AI coach, and a teacher
              cohort view. XP, levels, badges — all in your browser.
            </p>
            {coachStats && (
              <dl className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-900">
                <div>
                  <dt className="font-medium text-zinc-400">Size</dt>
                  <dd className="text-zinc-700 dark:text-zinc-300">
                    {coachStats.kb} KB
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-400">Last modified</dt>
                  <dd className="text-zinc-700 dark:text-zinc-300">
                    {coachStats.modified}
                  </dd>
                </div>
              </dl>
            )}
          </a>

          <a
            href="/learn"
            className="group flex flex-col gap-3 rounded-2xl border border-violet-200 bg-white p-6 transition-all hover:border-violet-300 hover:shadow-sm dark:border-violet-900/40 dark:bg-zinc-950 dark:hover:border-violet-800"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Learn &amp; Docs
              </h2>
              <span className="text-zinc-400 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Full feature documentation, a 6-phase student guide, 8 printable
              one-page cheat sheets, and a downloads section with zipped source
              and offline assets.
            </p>
            <p className="text-xs font-bold tracking-wide text-violet-700 uppercase">
              Open the docs →
            </p>
          </a>

          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-6 dark:border-zinc-800 dark:bg-zinc-950/40">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Build the React port
            </h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Start migrating the simulator into <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-900">app/</code>{" "}
              route by route. The static HTML is the source of truth until the
              port lands.
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <code>app/page.tsx</code> — landing shell
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <code>app/simulator/page.tsx</code> — main UI (TBD)
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <code>app/coach/page.tsx</code> — coach shell
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <code>app/learn/*</code> — docs &amp; downloads
              </li>
            </ul>
          </div>
        </section>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-900">
          <span>
            Next.js · App Router · TypeScript · Tailwind v4
          </span>
          <span>Run <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-900">npm run dev</code> to start</span>
        </footer>
      </main>
    </div>
  );
}
