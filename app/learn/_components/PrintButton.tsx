"use client";

import { useState } from "react";

type Props = {
  /** Optional label override. Defaults to "Print this page". */
  label?: string;
};

export function PrintButton({ label = "Print this page" }: Props) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        setBusy(true);
        try {
          window.print();
        } finally {
          // Give the print dialog a tick before clearing the busy state.
          setTimeout(() => setBusy(false), 600);
        }
      }}
      className="print:hidden inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
    >
      <span aria-hidden>🖨️</span>
      {busy ? "Opening print dialog…" : label}
    </button>
  );
}
