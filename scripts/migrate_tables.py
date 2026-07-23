#!/usr/bin/env python3
"""
Phase 5 migration: replace `<div className="table-wrap"><table>...</table></div>`
with `<Table>...</Table>` (children mode) in all AdConsole files.

Idempotent: if the file is already migrated, no change is made.
"""
import os
import re
import sys

ROOT = r"C:\Users\Agent\Documents\Amazon-ad-console\src\components\AdConsole"

# Files to migrate (the .tsx files that use .table-wrap)
TARGETS = [
    r"details\OverviewTab.tsx",
    r"details\NegativesTab.tsx",
    r"details\BudgetRulesTab.tsx",
    r"details\AdGroupsTab.tsx",
    r"details\TargetsTab.tsx",
    r"details\SearchTermsTab.tsx",
    r"details\ManagerCampaignsTab.tsx",
    r"details\ManagerAdGroupsTab.tsx",
    r"details\ManagerTargetsTab.tsx",
    r"details\ManagerSearchTermsTab.tsx",
    r"details\ManagerNegativesTab.tsx",
    r"features\bulk\BulkOpsPage.tsx",
    r"features\reports\ReportsPage.tsx",
    r"features\drills\DrillsPage.tsx",
    r"features\trainer\TrainerPage.tsx",
    r"PortfolioOverview.tsx",
    r"Dashboard.tsx",
    r"wizard\steps\sb\Step3ProductsCreative.tsx",
]


def migrate(path: str) -> bool:
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    original = text

    # 1. Add Table import after the first `@astryxdesign/core/...` import line,
    #    or as a fresh import. We append an "astryxdesign/core/Table" import.
    if "@astryxdesign/core/Table" not in text:
        # find the first @astryxdesign/core/... import and add Table import
        # right after it.
        m = re.search(r"^import .* from '@astryxdesign/core/[A-Za-z]+';$",
                      text, re.MULTILINE)
        if m:
            last = m
            # find the last consecutive astryx import
            for m2 in re.finditer(
                r"^import .* from '@astryxdesign/core/[A-Za-z]+';$",
                text, re.MULTILINE,
            ):
                # check if the next line is also an astryx import
                end = m2.end()
                next_line_start = end
                # see if next 200 chars contain another astryx import
                next_chunk = text[end:end + 200]
                if re.match(r"^import .* from '@astryxdesign/core/[A-Za-z]+';",
                            next_chunk):
                    last = m2
                else:
                    break
            insertion = last.end()
            text = (
                text[:insertion]
                + "\nimport { Table } from '@astryxdesign/core/Table';"
                + text[insertion:]
            )
        else:
            # no existing astryx import — add after the first Card or Button
            # import (whichever is first). Fall back to the very top.
            m = re.search(
                r"^import .* from '@astryxdesign/core/[A-Za-z]+';$",
                text, re.MULTILINE,
            )
            if m:
                insertion = m.end()
                text = (
                    text[:insertion]
                    + "\nimport { Table } from '@astryxdesign/core/Table';"
                    + text[insertion:]
                )
            else:
                # add after 'use client';
                m = re.search(r"^'use client';\n", text, re.MULTILINE)
                if m:
                    insertion = m.end()
                    text = (
                        text[:insertion]
                        + "\nimport { Table } from '@astryxdesign/core/Table';"
                        + text[insertion:]
                    )
                else:
                    print(f"WARN: no anchor for {path}; skipping import", file=sys.stderr)
                    return False

    # 2. Replace `<div className="table-wrap">` followed by `<table>` with `<Table>`.
    #    The pattern in our code is always:
    #      <div className="table-wrap">
    #        <table>
    #    (with any whitespace). We match `<div className="table-wrap">` and
    #    `<table>` and emit `<Table>`.
    new_text, n1 = re.subn(
        r'<div className="table-wrap">\s*<table>',
        "<Table>",
        text,
    )
    text = new_text

    # 3. Replace `</table>\s*</div>` (close) with `</Table>`.
    new_text, n2 = re.subn(r'</table>\s*</div>', "</Table>", text)
    text = new_text

    # 4. Sanity: ensure we actually changed something if the file had
    #    `table-wrap` originally.
    if "table-wrap" in original and (n1 == 0 or n2 == 0):
        print(f"ERROR: {path} has table-wrap but migration didn't match "
              f"(n1={n1}, n2={n2})", file=sys.stderr)
        return False

    if text == original:
        return False  # nothing to do

    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    return True


def main():
    changed = []
    for rel in TARGETS:
        full = os.path.join(ROOT, rel)
        if not os.path.exists(full):
            print(f"MISS: {full}", file=sys.stderr)
            continue
        if migrate(full):
            changed.append(rel)

    print(f"Changed {len(changed)} file(s):")
    for c in changed:
        print(f"  {c}")


if __name__ == "__main__":
    main()
