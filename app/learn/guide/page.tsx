import { PrintButton } from "../_components/PrintButton";

export const metadata = { title: "Student guide" };

const PHASES = [
  {
    week: "Week 0",
    title: "Set up",
    color: "bg-zinc-100 text-zinc-800",
    hours: "~2 hours",
    goal: "Get oriented and pass the first two module quizzes.",
    do: [
      "Open the app. Read the Dashboard. Skim the Glossary.",
      "Take the Module 0 quiz (Amazon Basics) cold — see where you stand.",
      "Read every Module 0 lesson. Mark each complete. Retake the quiz.",
      "Read every Module 1 lesson (What is PPC?). Take the quiz.",
    ],
    exit: "You can explain organic vs paid, the Buy Box, and ACOS in one sentence each.",
  },
  {
    week: "Week 1",
    title: "Learn the money",
    color: "bg-emerald-100 text-emerald-800",
    hours: "~6 hours",
    goal: "Own ACOS, ROAS, TACoS, and break-even.",
    do: [
      "Read Modules 2 (Money Math) and 3 (Campaign Structure).",
      "Pass both quizzes at 70%+.",
      "Open the Report Builder, plug in fake numbers, generate a sample report.",
      "Skim the Glossary cards for ACOS, ROAS, TACoS, break-even — copy them to a personal note.",
    ],
    exit: "You can compute ACOS from spend and sales, and explain why break-even ACOS equals your margin.",
  },
  {
    week: "Week 2",
    title: "Practice the core loop",
    color: "bg-sky-100 text-sky-800",
    hours: "~6 hours",
    goal: "Confidently run the weekly search term harvest.",
    do: [
      "Read Modules 4 (Keywords & Match Types) and 8 (Search Terms & Negatives).",
      "Open the Search Term Trainer. Run it 3 times. Aim for 80%+ on the third.",
      "Open the Campaign Builder. Build a starter campaign for each of the 3 practice products. Score 70+ on each.",
      "Pass both module quizzes at 70%+.",
    ],
    exit: "You can look at a search term row and pick the right action in under 30 seconds.",
  },
  {
    week: "Week 3",
    title: "Set up and budget",
    color: "bg-amber-100 text-amber-800",
    hours: "~6 hours",
    goal: "Build a four-week launch plan with safe bids and budgets.",
    do: [
      "Read Modules 6 (Campaign Setup) and 7 (Bids & Budgets).",
      "Walk through the New Product Launch Plan from Module 6.",
      "Use the Campaign Builder to mock a Week-1 → Week-4 budget split.",
      "Pass both module quizzes at 70%+.",
    ],
    exit: "You can explain why a profitable campaign running out of budget by noon is leaving money on the table.",
  },
  {
    week: "Week 4",
    title: "Operate and report",
    color: "bg-violet-100 text-violet-800",
    hours: "~8 hours",
    goal: "Run a full weekly cycle and pass the Final Exam.",
    do: [
      "Read Modules 9 (Weekly Optimization) and 10 (Reporting & Troubleshooting).",
      "Open the Report Builder. Write a fake but realistic weekly report. Copy it. Critique your own writing.",
      "Open the Search Term Trainer and the Campaign Builder one more time. Beat your previous bests.",
      "Take the Final Exam. Aim for 85%+.",
      "Read Module 11 (VA Workflow & Capstone) for the day-one-on-the-job routine.",
    ],
    exit: "You can run a complete weekly cycle (review → harvest → report) and explain each step to a manager.",
  },
  {
    week: "After",
    title: "On the job",
    color: "bg-rose-100 text-rose-800",
    hours: "Ongoing",
    goal: "Operate, don’t panic.",
    do: [
      "Follow the daily / weekly / monthly cadence from the VA Cadence handout.",
      "Use the Permissions Ladder from Module 11 — small safe changes alone, big levers with approval.",
      "Write every bid change in a change log. Memory lies; logs don’t.",
      "When in doubt: stock, price, reviews, competitors — in that order.",
    ],
    exit: "You are operating under supervision. After 30 days of clean change logs, you earn unsupervised work.",
  },
];

export default function StudentGuidePage() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">
          Student guide
        </p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-bold text-zinc-900">
            From zero to operating VA
          </h1>
          <PrintButton />
        </div>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          A six-phase path from opening the app for the first time to running
          a real account under supervision. About 30 hours total. Take it at
          your own pace — but finish each phase before moving to the next.
        </p>
      </header>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-display text-lg font-bold text-amber-900">
          The two rules that matter most
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-amber-900">
          <li>
            <b>One change at a time.</b> Science beats vibes. Change one
            variable, wait a week, compare before-and-after, log it.
          </li>
          <li>
            <b>Stock, price, reviews, competitors — in that order.</b> When
            something breaks, check the boring four before touching any
            campaign setting.
          </li>
        </ol>
      </section>

      <section className="space-y-6">
        {PHASES.map((p) => (
          <article
            key={p.week}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
          >
            <header className={`flex items-center gap-3 px-6 py-4 ${p.color}`}>
              <span className="font-display text-lg font-bold">{p.week}</span>
              <span className="font-display text-lg font-bold">·</span>
              <h3 className="font-display text-lg font-bold">{p.title}</h3>
              <span className="ml-auto rounded-full bg-white/60 px-3 py-1 text-xs font-bold">
                {p.hours}
              </span>
            </header>
            <div className="space-y-4 p-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                  Goal
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {p.goal}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                  What to do
                </p>
                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-zinc-700">
                  {p.do.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-500">▸</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                <b>Exit check:</b> {p.exit}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-zinc-900">
          What to do when you’re stuck
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-zinc-700">
          <li>
            Re-read the relevant <b>lesson</b>. Most answers are in there.
          </li>
          <li>
            Search the <b>glossary</b> for the unfamiliar word.
          </li>
          <li>
            Ask the <b>AI Coach</b> in plain words. Try the suggested questions first.
          </li>
          <li>
            Run the relevant <b>practice tool</b> (Trainer, Builder, Report) — the act of doing it surfaces the gap.
          </li>
          <li>
            <b>Take the module quiz</b>. The wrong answers tell you exactly which lessons to revisit.
          </li>
          <li>
            Only then: ask a teacher or mentor. Bring your notes and your best guess.
          </li>
        </ol>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-display text-lg font-bold text-amber-900">
          Graduation checklist
        </h2>
        <p className="mt-2 text-sm text-amber-800">
          You are ready to operate under supervision when all of these are
          true. Circle the date you pass each one.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-amber-900">
          {[
            "12 module quizzes passed at 70%+",
            "Final Exam passed at 85%+",
            "Search Term Trainer best score 70%+",
            "Campaign Builder best score 70+",
            "Generated at least 1 weekly report",
            "Asked the AI Coach at least 1 question",
            "Read every lesson in the course",
            "Earned at least 4 of the 6 badges",
          ].map((c, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="inline-block size-4 rounded border-2 border-amber-400" />
              {c}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
