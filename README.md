# Amazon-ad-console

**Central management console for Amazon advertising operations.**

Built by [Ryan Roland Dabao](https://linkedin.com/in/ryan-roland-dabao-55416187) — Amazon PPC Lead Manager with 10+ years of remote eCommerce experience and $500K+/month in managed ad spend.

---

## Overview

A unified dashboard and tooling hub for managing Amazon ad campaigns across multiple accounts, campaigns, and performance tiers. Designed for PPC agencies and in-house brand teams who need operational efficiency at scale.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + shadcn/ui + Tailwind CSS |
| State | React hooks + Zustand |
| API | Next.js Route Handlers |
| Auth | NextAuth.js (multi-account) |
| Database | PostgreSQL + Prisma ORM |
| Deployment | Vercel |

## Quick Start

```bash
git clone https://github.com/projectamazonph/Amazon-ad-console.git
cd Amazon-ad-console
npm install
cp .env.example .env.local
# Fill in NEXT_AUTH_SECRET, DATABASE_URL, Amazon Ads API credentials
npm run dev
```

## Features

- **Multi-account dashboard** — view and switch between Amazon Ads accounts
- **Campaign management** — create, edit, pause campaigns and ad groups
- **Keyword & match-type tools** — bulk operations, match-type expansion
- **Performance reporting** — ACOS, TACOS, ROAS dashboards with date filtering
- **Budget pacing** — daily/monthly budget alerts and auto-rules
- **Bulk operations** — CSV import/export for campaign adjustments

## 📊 Codegraph

See [codegraphs/Amazon-ad-console.md](./codegraphs/Amazon-ad-console.md) for the full dependency graph.

---

Built by [ProjectAmazonPH](https://github.com/projectamazonph) — training Filipino virtual assistants to become Amazon advertising specialists.
