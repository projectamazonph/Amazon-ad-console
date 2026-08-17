import Link from "next/link";

const NAV = [
  { href: "/learn", label: "Overview", icon: "📖" },
  { href: "/learn/features", label: "Features", icon: "🧩" },
  { href: "/learn/guide", label: "Student Guide", icon: "🎓" },
  { href: "/learn/handouts", label: "Handouts", icon: "📝" },
  { href: "/learn/downloads", label: "Downloads", icon: "📦" },
];

export function Sidebar() {
  return (
    <nav className="print:hidden sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white p-4 sm:block">
      <ul className="space-y-1 text-sm">
        {NAV.map((n) => (
          <li key={n.href}>
            <Link
              href={n.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-zinc-700 transition hover:bg-amber-50 hover:text-amber-700"
            >
              <span aria-hidden>{n.icon}</span>
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <p className="font-bold">Tip</p>
        <p className="mt-1 leading-5 text-amber-800">
          Press <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono">Ctrl</kbd>+<kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono">P</kbd> on any handout to save it as PDF.
        </p>
      </div>
      <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
        <p className="font-bold text-zinc-800">Open the app</p>
        <Link
          href="/coach"
          className="mt-1 inline-block font-semibold text-amber-700 hover:underline"
        >
          Launch PPC Coach →
        </Link>
      </div>
    </nav>
  );
}
