import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6 font-sans dark:from-black dark:to-zinc-950">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-500">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          The route you tried doesn&apos;t exist. The legacy simulator is still
          available at <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-900">/adconsole.html</code>.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            ← Back to home
          </Link>
          <a
            href="/adconsole.html"
            className="inline-flex h-10 items-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Open legacy simulator
          </a>
        </div>
      </div>
    </div>
  );
}
