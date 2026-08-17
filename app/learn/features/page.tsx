import { PrintButton } from "../_components/PrintButton";

export const metadata = { title: "Feature documentation" };

type Feature = {
  id: string;
  icon: string;
  name: string;
  tagline: string;
  what: string;
  when: string[];
  steps: string[];
  proTips: string[];
  mistakes: string[];
  related: { label: string; module: string }[];
};

const FEATURES: Feature[] = [
  {
    id: "dashboard",
    icon: "🏠",
    name: "Dashboard",
    tagline: "Your progress at a glance.",
    what: "The landing screen. Shows your level, XP, course progress, quiz pass rate, practice bests, module-by-module progress, badges, and a donut chart of overall completion.",
    when: [
      "Start of every session to see where you left off",
      "End of every session to log how you moved",
      "When you want a quick proof of progress for a teacher or client",
    ],
    steps: [
      "Open the app — Dashboard loads by default",
      "Skim the four stat cards: Course progress, Total XP, Quizzes, Practice bests",
      "Tap “Continue learning” if you have an unfinished lesson",
      "Check the donut — it’s the same number as Course progress, just visual",
    ],
    proTips: [
      "XP rolls up from lessons, quizzes, and practice. One finished lesson = 20 XP.",
      "Badges turn from grey to color when earned — six in total.",
      "Click “Open lessons” on the module grid to jump straight into a module.",
    ],
    mistakes: [
      "Reading the dashboard as a grade — it’s a tracker, not a test.",
      "Ignoring the donut — it’s a great sanity check that progress is moving.",
    ],
    related: [
      { label: "Levels and XP", module: "M0 (intro) + M11 (capstone)" },
      { label: "Module 0", module: "Amazon Basics" },
    ],
  },
  {
    id: "lessons",
    icon: "📚",
    name: "Lessons",
    tagline: "12 modules, 40 plain-language lessons.",
    what: "The core course. Each module is a theme (Marketplace, PPC, Money Math, etc.); each lesson is a 5–12 minute reading with goals, examples, formulas, and a quiz. Mark complete to earn 20 XP.",
    when: [
      "First 1–2 weeks of training",
      "When you hit a concept you don’t recognize from a quiz",
      "When a teacher assigns a module",
    ],
    steps: [
      "Open Lessons",
      "Pick a module — color-coded by topic",
      "Pick a lesson — green check = done, grey number = todo",
      "Read blocks: 🎯 goal, body text, 📊 diagrams, 💡 tips, 🧪 examples, ✏️ formulas, ⚠️ mistakes, ✅/🚫 do/don’t splits",
      "Tap “Mark complete · +20 XP” at the bottom",
      "On the last lesson of a module, take the module quiz",
    ],
    proTips: [
      "Read the “In this lesson” box first — it tells you what you should be able to do at the end.",
      "Skim tables and examples first; come back to prose for depth.",
      "The “Coach tip” at the end of each lesson is the single thing to remember.",
    ],
    mistakes: [
      "Skipping lessons and going straight to the quiz — quizzes recycle lesson language.",
      "Marking complete without reading — XP is worthless if you didn’t learn the rule.",
    ],
    related: [
      { label: "All 12 modules", module: "M0 → M11" },
      { label: "Final exam", module: "Quiz Arena" },
    ],
  },
  {
    id: "glossary",
    icon: "📖",
    name: "Glossary",
    tagline: "25 terms, explained like a human.",
    what: "Searchable one-liner definitions for every PPC term you’ll meet: CPC, CTR, ACOS, ROAS, TACoS, break-even, match types, Buy Box, harvesting, long-tail, and more. Click a card to copy it.",
    when: [
      "Any time you read or hear a term you don’t recognize",
      "Before a quiz or a client call",
      "When a colleague uses a word and you nod but don’t quite get it",
    ],
    steps: [
      "Open Glossary",
      "Type a term in the search box (e.g. “ACOS”)",
      "Read the card — it’s deliberately one sentence",
      "Click the card to copy the definition to your clipboard",
    ],
    proTips: [
      "The glossary is a reference, not a course. Don’t try to memorize it — use it.",
      "Every term in the glossary appears in at least one lesson. If a term is unclear, jump to the related module.",
      "Copy-to-clipboard is great for pasting into Slack replies to clients.",
    ],
    mistakes: [
      "Memorizing jargon without understanding — “ACOS is the cost of sales” is not enough; you need the formula and the margin comparison.",
    ],
    related: [
      { label: "Money Math", module: "M2" },
      { label: "Keywords & Match Types", module: "M4" },
    ],
  },
  {
    id: "trainer",
    icon: "🕵️",
    name: "Search Term Trainer",
    tagline: "Grade your weekly harvest.",
    what: "A 10-row simulator that mimics a real search term report. You pick an action for each term — promote to Exact, add as negative, lower the bid, or watch. The app grades you out of 100%.",
    when: [
      "After every weekly search term review (every Tuesday-ish)",
      "Before your first real harvest on a client account",
      "When a quiz question about match types or negatives trips you up",
    ],
    steps: [
      "Open Search Term Trainer",
      "Read the practice product: Bamboo Cutting Board, 30% margin",
      "For each of the 10 search terms, pick the right action",
      "Click “Grade my decisions”",
      "Read the per-row explanation — even on the rows you got right",
    ],
    proTips: [
      "Margin is 30%, so break-even ACOS is 30%. Anything under 30% is profitable; anything over 30% needs a bid cut or a negative.",
      "“Watch” is a valid choice when clicks are below 10. Small samples make loud lies.",
      "First attempts earn 5 XP per correct decision — re-takes don’t double-dip.",
    ],
    mistakes: [
      "Negate after 2 clicks — irrelevant terms get negated, but only when you’re sure.",
      "Pause a campaign for one bad term — fix the term, not the whole structure.",
      "Forget the search term report exists in real life — the trainer is a rehearsal, not a substitute.",
    ],
    related: [
      { label: "Search Terms & Negatives", module: "M8" },
      { label: "Money Math", module: "M2" },
    ],
  },
  {
    id: "builder",
    icon: "🏗️",
    name: "Campaign Builder",
    tagline: "Build a starter campaign, get a score out of 100.",
    what: "Pick a product, name your campaign, set a daily budget, add Exact/Phrase/Broad keywords with bids, add negatives. The app scores your structure against six beginner-safe rules.",
    when: [
      "Before launching a new product",
      "Before restructuring an old account",
      "When you’re not sure if your naming/bid/negatives setup is sane",
    ],
    steps: [
      "Open Campaign Builder",
      "Pick a product (Bamboo Board, Garlic Press, or Yoga Mat)",
      "Name your campaign: SP | Exact | Product | Purpose",
      "Set a daily budget (start small: $10–$50)",
      "Add at least 2 Exact keywords, bids between $0.50–$1.50",
      "Add at least 2 negative keywords (wrong material, wrong use, etc.)",
      "Click “Score my campaign”",
      "Read the failures, fix, and re-score",
    ],
    proTips: [
      "Naming follows a pattern: ad-type | match | product | purpose. Future-you will read this in 3 months.",
      "Avoid “broad” on day one — start tight, loosen once data tells you where to spend.",
      "Read the Grading Rules card before you start — it’s the rubric.",
    ],
    mistakes: [
      "Naming like “test1” or “final_final” — names should explain themselves.",
      "Budgeting huge on a brand new product — start small, learn, scale.",
      "Skipping negatives — they are the single fastest profit lever.",
    ],
    related: [
      { label: "Campaign Structure", module: "M3" },
      { label: "Bids & Budgets", module: "M7" },
      { label: "Campaign Setup", module: "M6" },
    ],
  },
  {
    id: "report",
    icon: "📊",
    name: "Report Builder",
    tagline: "Numbers in, client-ready report out.",
    what: "Enter the week’s spend, sales, clicks, impressions, orders, and your margin. The app calculates ACOS, ROAS, CPC, CTR, conversion rate, and writes a plain-words report you can paste into Slack or email.",
    when: [
      "End of every week (Friday, per the weekly routine)",
      "Before a client call",
      "When a manager asks “how did the account do this week?”",
    ],
    steps: [
      "Open Report Builder",
      "Enter the six numbers from the week",
      "Watch the metric cards light up green or red",
      "Edit the “What worked”, “Problems”, and “Next steps” boxes",
      "Click “Generate report”",
      "Click “Copy to clipboard”",
      "Paste into your client’s preferred channel",
    ],
    proTips: [
      "ACOS green means below your margin; red means above. Always compare to margin, never to a generic target.",
      "TACoS drops when ads are building the brand; ACOS dropping is not always the win — look at TACoS too.",
      "End every report with next steps. Numbers inform; steps reassure.",
    ],
    mistakes: [
      "Hiding bad numbers — they always get found. Own them with a proposed fix.",
      "Reporting ACOS without context — always pair with margin and the trend.",
      "Forgetting impressions — without them you can’t compute CTR, and CTR is the hook signal.",
    ],
    related: [
      { label: "Reporting & Troubleshooting", module: "M10" },
      { label: "Money Math", module: "M2" },
    ],
  },
  {
    id: "quiz",
    icon: "🧠",
    name: "Quiz Arena",
    tagline: "13 quizzes. Pass at 70% to earn the badge.",
    what: "A 12-module quiz (4–5 questions each) plus a 15-question Final Exam. Multiple choice, immediate feedback, XP rewards. Your best score is saved.",
    when: [
      "After each module (the last lesson of every module links straight to its quiz)",
      "Before a client interview",
      "The week before you take on real client work — run the Final Exam",
    ],
    steps: [
      "Open Quiz Arena",
      "Pick a module or the Final Exam",
      "Tap an answer; the right answer lights green, the wrong one lights red",
      "Read the explanation — even on correct answers",
      "Tap “Next”",
      "At the end, see your score and either Retry or Back to Arena",
    ],
    proTips: [
      "Retake as often as you want — only your best score counts.",
      "If you score under 70% on a module, re-read that module’s lessons, then retry.",
      "The Final Exam is the closest thing to a real interview — take it cold once, then again after a week of study.",
    ],
    mistakes: [
      "Skimming the explanation — the “why” matters more than the “what”.",
      "Treating 70% as a pass and moving on — 85%+ is the capstone target for supervised work.",
    ],
    related: [
      { label: "All modules", module: "M0 → M11" },
      { label: "Final Exam", module: "Quiz Arena (top-right card)" },
    ],
  },
  {
    id: "coach",
    icon: "💬",
    name: "AI Coach",
    tagline: "Plain-words answers, no jargon.",
    what: "A rule-based chat that answers the most common PPC questions in plain English. Canned replies — fast, consistent, and easy to verify. Not a real AI; don’t expect it to invent answers to novel questions.",
    when: [
      "Any time you have a quick question and don’t want to scroll the glossary",
      "When you want a one-paragraph explanation with an example",
      "When you’re stuck and just need someone to point you at the right next step",
    ],
    steps: [
      "Open AI Coach",
      "Tap a suggested question, or type your own in plain words",
      "Read the answer — usually one paragraph with an example",
      "If the answer doesn’t match, try different keywords (e.g. “clicks no sales” vs “conversion low”)",
    ],
    proTips: [
      "The Coach matches keywords. If you ask “ROAS” you’ll get the ROAS rule. If you ask “ROI” you’ll get the fallback.",
      "Use the suggested-question chips — they’re curated to hit the most useful answers.",
    ],
    mistakes: [
      "Asking for account-specific decisions (“should I pause this campaign?”) — the Coach doesn’t know your account.",
      "Treating the Coach as a substitute for a real mentor — it’s a faster glossary, not a strategist.",
    ],
    related: [
      { label: "Money Math", module: "M2" },
      { label: "Reporting & Troubleshooting", module: "M10" },
    ],
  },
  {
    id: "cohort",
    icon: "👥",
    name: "Cohort (Teacher View)",
    tagline: "For teachers running a live class.",
    what: "A read-only table of 8 mock students, with progress, XP, weak area, last-active date, and status (STAR, ON TRACK, AT RISK). Top-of-page cards show cohort average, at-risk count, and top performer.",
    when: [
      "Before a class to see who needs a check-in",
      "After a class to identify the next week’s focus area",
      "When you’re deciding which students to fast-track or pair up",
    ],
    steps: [
      "Open Cohort (Teacher)",
      "Skim the three summary cards at the top",
      "Scan the Students table",
      "Use the search box to filter by name",
      "Click into a student’s weak area to plan a 1-on-1",
    ],
    proTips: [
      "AT RISK = inactive 3+ days or under 30% progress — those are the ones to message first.",
      "Run the Search Term Trainer live in class — let students defend their decisions out loud. Judgment grows faster than button-clicking.",
      "Pair STAR students with AT RISK students — peer teaching is the highest-ROI move in a small cohort.",
    ],
    mistakes: [
      "Reading the table as a leaderboard — it’s a teaching tool, not a ranking.",
      "Pushing the top student harder while ignoring the at-risk ones — the at-risk ones are where the leverage is.",
    ],
    related: [
      { label: "VA Workflow & Capstone", module: "M11" },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <article className="space-y-12">
      <header className="space-y-3">
        <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">
          Documentation
        </p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-bold text-zinc-900">
            Every feature, documented
          </h1>
          <PrintButton />
        </div>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          Nine views, nine docs. Each one tells you what the screen does, when
          to open it, the exact steps to use it, the pro tips behind it, the
          common mistakes to avoid, and where it lives in the course.
        </p>
      </header>

      <nav className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
          Jump to
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.id}>
              <a
                href={`#${f.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-amber-50 hover:text-amber-700"
              >
                <span aria-hidden>{f.icon}</span>
                {f.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {FEATURES.map((f) => (
        <section
          key={f.id}
          id={f.id}
          className="scroll-mt-24 space-y-5 border-t border-zinc-200 pt-8"
        >
          <header className="space-y-1">
            <div className="flex items-center gap-2 text-2xl">
              <span aria-hidden>{f.icon}</span>
              <h2 className="font-display text-2xl font-bold text-zinc-900">
                {f.name}
              </h2>
            </div>
            <p className="text-base font-semibold text-amber-700">
              {f.tagline}
            </p>
          </header>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              What it is
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-700">{f.what}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              When to use it
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-zinc-700">
              {f.when.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              Step-by-step
            </h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-zinc-700">
              {f.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
                Pro tips
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-emerald-900">
                {f.proTips.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span>✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 className="text-xs font-bold tracking-widest text-red-700 uppercase">
                Common mistakes
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-red-900">
                {f.mistakes.map((m, i) => (
                  <li key={i} className="flex gap-2">
                    <span>✕</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <b>Related in the course:</b>{" "}
            {f.related.map((r, i) => (
              <span key={i}>
                {i > 0 ? " · " : ""}
                {r.label}
              </span>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
