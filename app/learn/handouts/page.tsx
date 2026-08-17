import { PrintButton } from "../_components/PrintButton";

export const metadata = { title: "Printable handouts" };

type Handout = {
  id: string;
  title: string;
  oneLiner: string;
  body: React.ReactNode;
};

const HANDOUTS: Handout[] = [
  {
    id: "acos",
    title: "ACOS Cheat Sheet",
    oneLiner: "One page. Every ACOS question you’ll be asked.",
    body: (
      <>
        <Formula
          f="ACOS = Spend ÷ Sales × 100"
          note="Lower is better. Always compare to your margin."
        />
        <Table
          head={["ACOS", "Reading", "Action"]}
          rows={[
            ["Under margin", "Profitable", "Raise bid a little, scale carefully"],
            ["At margin", "Break-even", "Watch; small bid cuts are fine"],
            ["Over margin", "Losing money", "Cut bid, tighten match, or negate"],
            ["No sales", "Emergency", "Check relevance, listing, Buy Box"],
          ]}
        />
        <p className="text-sm text-zinc-700">
          <b>Break-even ACOS = your profit margin.</b> A 30% margin means
          30% ACOS is the break-even line. Anything below 30% likely makes
          money; anything above likely loses money. This is the single most
          important fact about ACOS.
        </p>
      </>
    ),
  },
  {
    id: "match-types",
    title: "Match Types Cheat Sheet",
    oneLiner: "Broad, phrase, exact — and when to use each.",
    body: (
      <>
        <Table
          head={["Type", "Reach", "Control", "Use it for"]}
          rows={[
            ["Broad", "High", "Low", "Research. Discover new search terms."],
            ["Phrase", "Medium", "Medium", "Mid-funnel. Words must include your phrase."],
            ["Exact", "Low", "High", "Control and scale. Use for proven winners."],
          ]}
        />
        <p className="text-sm text-zinc-700">
          <b>Rule of thumb:</b> Start tight (Exact). Use Broad and Auto only
          as scouts. Promote research winners into Exact. Never run a new
          account on Broad only.
        </p>
        <p className="text-sm text-zinc-700">
          <b>Negative keywords</b> block irrelevant searches. They are the
          fastest profit lever in PPC. Add wasters from the search term
          report weekly.
        </p>
      </>
    ),
  },
  {
    id: "bids",
    title: "Bids & Budgets Cheat Sheet",
    oneLiner: "Five situations, five safe responses.",
    body: (
      <Table
        head={["Situation", "Reading", "Action"]}
        rows={[
          ["No impressions", "Bid too low or too narrow", "Raise a little, widen targeting slightly"],
          ["Clicks, no sales", "Wrong terms or weak page", "Add negatives, check listing"],
          ["Sales + low ACOS", "Winner", "Raise bid carefully, watch for a week"],
          ["Sales + high ACOS", "Too expensive", "Lower bid or tighten match"],
          ["Budget dies early", "Profitable but capped", "Raise budget — you’re leaving sales on the table"],
        ]}
      />
    ),
  },
  {
    id: "search-terms",
    title: "Search Term Mining Cheat Sheet",
    oneLiner: "The weekly harvest, in seven steps.",
    body: (
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-zinc-700">
        <li>Download the search term report for the last 7–14 days.</li>
        <li>Sort by spend, highest first.</li>
        <li>Mark each term: winner, waster, or maybe.</li>
        <li>
          <b>Winners</b> (sales + ACOS under margin): promote to Exact.
        </li>
        <li>
          <b>Wasters</b> (high clicks, no sales, irrelevant): add as negative.
        </li>
        <li>
          <b>Maybes</b> (under 10 clicks): watch — too little data.
        </li>
        <li>Log every change. Repeat next week.</li>
      </ol>
    ),
  },
  {
    id: "launch",
    title: "4-Week New Product Launch Plan",
    oneLiner: "Learn week 1, control week 2, clean week 3, scale week 4.",
    body: (
      <Table
        head={["Week", "Focus", "Action"]}
        rows={[
          ["1", "Learn", "Auto only, small bids, watch terms"],
          ["2", "Control", "Exact campaign with long-tail winners"],
          ["3", "Clean", "First negatives pass; kill obvious wasters"],
          ["4", "Scale", "+10–20% budget on proven winners only"],
        ]}
      />
    ),
  },
  {
    id: "cadence",
    title: "VA Daily / Weekly / Monthly Cadence",
    oneLiner: "What to do, when, and how often.",
    body: (
      <Table
        head={["Cadence", "Tasks"]}
        rows={[
          ["Daily (5 min)", "Spend, alerts, stock, accidental pauses"],
          ["Weekly (1 hr)", "Term harvest, negatives, bid review, report"],
          ["Monthly (2 hr)", "Structure review, top keywords, listing audit, cleanup"],
        ]}
      />
    ),
  },
  {
    id: "troubleshoot",
    title: "Troubleshooting Cheat Sheet",
    oneLiner: "The boring four — check them first, every time.",
    body: (
      <Table
        head={["Problem", "First check", "Then"]}
        rows={[
          ["No impressions", "Campaign active? Approved?", "Bid too low, budget too small, targeting too narrow"],
          ["Low CTR", "Image, price, title", "Reposition hook, A/B test image"],
          ["Clicks, no sales", "Listing + term relevance", "Negatives, listing pass, price check"],
          ["High ACOS", "CPC vs conversion", "Lower bid, tighten match, or both"],
          ["Sales drop", "Stock, price, reviews, competitor", "If all four are fine, look at the campaign structure"],
        ]}
      />
    ),
  },
  {
    id: "report",
    title: "Weekly Report Format",
    oneLiner: "What every report needs, in order.",
    body: (
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-zinc-700">
        <li><b>Numbers:</b> spend, sales, ACOS, ROAS, clicks, orders, CTR, conversion.</li>
        <li><b>Trend vs last week.</b> One line, plus or minus X%.</li>
        <li><b>What worked.</b> One short paragraph, 1–2 examples.</li>
        <li><b>What did not work.</b> One short paragraph, honest.</li>
        <li><b>Next steps.</b> 2–3 bullets, actioned in the next 7 days.</li>
        <li><b>Prepared by.</b> Your name, date.</li>
      </ol>
    ),
  },
];

export default function HandoutsPage() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">
          Handouts
        </p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-bold text-zinc-900">
            Eight one-page cheat sheets
          </h1>
          <PrintButton />
        </div>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          Every cheat sheet is one page, one topic, one printable artifact.
          Click any title to jump to it. Press <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs font-mono">Ctrl</kbd>+<kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs font-mono">P</kbd> on a single handout page to save as PDF.
        </p>
      </header>

      <nav className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
          On this page
        </p>
        <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HANDOUTS.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className="block rounded-lg px-2 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-amber-50 hover:text-amber-700"
              >
                {h.title}{" "}
                <span className="font-normal text-zinc-500">
                  — {h.oneLiner}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {HANDOUTS.map((h) => (
        <section
          key={h.id}
          id={h.id}
          className="scroll-mt-24 space-y-4 break-inside-avoid rounded-2xl border-2 border-zinc-200 bg-white p-6"
        >
          <header className="border-b border-zinc-200 pb-3">
            <h2 className="font-display text-2xl font-bold text-zinc-900">
              {h.title}
            </h2>
            <p className="text-sm text-zinc-600">{h.oneLiner}</p>
          </header>
          <div className="space-y-3">{h.body}</div>
        </section>
      ))}

      <p className="text-center text-xs text-zinc-400">
        End of handouts. Press <kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">P</kbd> now to print this whole page.
      </p>
    </article>
  );
}

function Formula({ f, note }: { f: string; note: string }) {
  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-center">
      <div className="font-display text-lg font-bold text-amber-900">{f}</div>
      <div className="text-xs text-amber-700">{note}</div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900 text-white">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-bold uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 ? "bg-zinc-50" : ""}>
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 text-zinc-800">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
