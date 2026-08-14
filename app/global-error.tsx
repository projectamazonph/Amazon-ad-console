"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// global-error replaces the root layout, so it must define its own <html>/<body>
// and pull in its own styles/fonts. Metadata export is not allowed here; we set
// <title> via the React component.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[app/global-error] root layout error:", error);
    }
  }, [error]);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-zinc-900 antialiased dark:bg-black dark:text-zinc-50">
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6 font-sans dark:from-black dark:to-zinc-950">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-sm dark:border-red-900/50 dark:bg-zinc-950">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <span className="size-1.5 rounded-full bg-red-500" />
              Something went wrong
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              The page hit an error
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              The Next.js shell couldn&apos;t render this route. The legacy
              simulator is unaffected.
            </p>

            <pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              {error.message}
              {error.digest ? `\n\ndigest: ${error.digest}` : ""}
            </pre>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => unstable_retry()}
                className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Try again
              </button>
              <a
                href="/adconsole.html"
                className="inline-flex h-10 items-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Open legacy simulator
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
