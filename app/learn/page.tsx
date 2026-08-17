import Link from "next/link";

export default function LearnHubPage() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">
          PPC Coach · Documentation
        </p>
        <h1 className="font-display text-4xl font-bold text-zinc-900">
          Learn, practice, ship.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          Everything you need to go from a complete beginner to a competent
          Amazon PPC VA manager. Pick a starting point — every page is
          printable, every handout is a one-page cheat sheet, every
          downloadable is yours to keep.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card
          href="/learn/features"
          icon="🧩"
          title="Feature documentation"
          desc="What every screen in the app does, when to use it, and the pro tips behind each one."
          cta="Read the docs"
        />
        <Card
          href="/learn/guide"
          icon="🎓"
          title="Student guide"
          desc="A week-by-week walkthrough from day zero to your first supervised client account."
          cta="Open the guide"
        />
        <Card
          href="/learn/handouts"
          icon="📝"
          title="Printable handouts"
          desc="Eight one-page cheat sheets — ACOS, match types, bids, search terms, the launch plan, and more."
          cta="Browse handouts"
        />
        <Card
          href="/learn/downloads"
          icon="📦"
          title="Downloads"
          desc="Zipped source, starter kit, 4-week launch plan, and offline copies of the app."
          cta="See downloads"
        />
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-display text-lg font-bold text-amber-900">
          How to use this site
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-amber-900">
          <li>
            <b>New here?</b> Start with the <Link href="/learn/guide" className="underline">Student Guide</Link> — it lays out the four-week path.
          </li>
          <li>
            <b>Mid-task?</b> Skim the <Link href="/learn/features" className="underline">Feature docs</Link> for the screen you&apos;re stuck on.
          </li>
          <li>
            <b>Need a refresher?</b> Open the <Link href="/learn/handouts" className="underline">Handouts</Link> and print the relevant cheat sheet.
          </li>
          <li>
            <b>Going offline?</b> Grab the <Link href="/learn/downloads" className="underline">Downloads</Link> — the whole app, the launch plan, and the starter kit.
          </li>
        </ol>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-zinc-900">
          What is PPC Coach?
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          A teaching companion for Amazon PPC. Twelve plain-language modules,
          a 25-term glossary, a search-term grader, a campaign builder that
          scores your work, a one-page report generator, a quiz arena with
          13 quizzes, an AI coach, and a teacher cohort view. Progress,
          levels, and badges are stored in your browser.
        </p>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Built for Filipino VAs and junior strategists moving into Amazon
          advertising roles. No fluff, no jargon, no theory without an
          example.
        </p>
      </section>
    </article>
  );
}

function Card({
  href,
  icon,
  title,
  desc,
  cta,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-sm"
    >
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-display text-base font-bold text-zinc-900 group-hover:text-amber-700">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{desc}</p>
      <p className="mt-3 text-xs font-bold tracking-wide text-amber-700 uppercase">
        {cta} →
      </p>
    </Link>
  );
}
