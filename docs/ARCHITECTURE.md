# Architecture

## Design Philosophy

The Amazon Ad Console follows **SOLID principles** with strict separation between business logic (engine) and presentation (React UI). The engine layer has **zero framework dependencies** — it is pure TypeScript that can run in any JavaScript environment.

## Layer Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js App Router (pages/layout)          │
├─────────────────────────────────────────────┤
│  React Components (UI layer)                │
│  Components/AdConsole/*                     │
├─────────────────────────────────────────────┤
│  Zustand Store (state management)           │
│  store.ts — composed root store             │
│  8 independent slices                       │
├─────────────────────────────────────────────┤
│  API Routes (server-side)                   │
│  /api/auth/* — authentication               │
│  /api/campaigns/* — campaign CRUD           │
│  /api/sync — bulk data sync                 │
├─────────────────────────────────────────────┤
│  Database Layer (Prisma + Postgres)         │
│  User, Campaign, Simulation models          │
├─────────────────────────────────────────────┤
│  Feature Engines (per-module business logic)│
│  features/drills/engine.ts                  │
│  features/profiles/engine.ts                │
│  features/trainer/engine.ts                 │
│  features/bulk/engine.ts                    │
│  features/reports/engine.ts                 │
│  features/missions/engine.ts                │
│  features/integrity/engine.ts               │
├─────────────────────────────────────────────┤
│  Core Engine (zero dependencies)            │
│  core/engine/ — per-domain modules:         │
│    campaign.ts — normalization, lifecycle   │
│    target.ts — keyword, ASIN, category, auto│
│    adgroup.ts — ad group CRUD               │
│    negative.ts — filters, harvesting        │
│    budget.ts    — budget rule CRUD          │
│    portfolio.ts — portfolio operations      │
│    draft.ts    — campaign wizard helpers    │
│    id.ts       — ID generation              │
│    metrics.ts  — calc, format helpers       │
│    search-term-generator.ts — Strategy pat. │
│    responsive.ts — breakpoints, mobile menu │
│  core/simulation.ts — 7-day perf simulation │
│  core/types.ts — all domain interfaces      │
│  core/scenarios.ts — training scenario defs │
└─────────────────────────────────────────────┘
```

## SOLID Principles Applied

### Single Responsibility
Each feature module owns exactly one concern:
- `drills/` — navigation coaching and scoring
- `profiles/` — multi-user trainee management
- `trainer/` — certification checklist and action grading
- `bulk/` — CSV parsing and validation
- `reports/` — report generation and CSV export
- `missions/` — scenario-based challenges
- `integrity/` — data quality auditing

### Open/Closed
The store is composed via `StateCreator` slices. Adding a new feature means creating a new `features/<name>/` directory with `types.ts`, `engine.ts`, `store.ts` — no existing files need modification.

### Liskov Substitution
All store slices implement independent `StateCreator<T>` interfaces. The root store combines them via intersection (`CoreSlice & DrillsSlice & ...`) — any slice can be swapped or mocked independently.

### Interface Segregation
Each feature exports its own typed slice interface (`DrillsSlice`, `ProfilesSlice`, etc.). Components import only the slice types they need. The core `AppStore` type is a composition of all slices.

### Dependency Inversion
- Components depend on the `useAdConsoleStore` hook (abstraction), not on concrete state shape
- Feature engines depend only on `core/types.ts` interfaces (abstractions)

## Entity Hierarchy

The console models the Amazon Advertising API entity structure:

```
Account (system level)
└── Portfolio — free-text grouping of campaigns
└── Campaign (SP / SB / SD)
    ├── AdGroup — bid + status container
    │   └── Target — keyword, ASIN, category, auto, audience
    ├── ProductAd — SP/SB product assignment
    ├── Ad — SB/SD creative assignment
    ├── SearchTerm — shopper query report (linked to Target)
    ├── Negative — campaign-level or ad-group-level filter
    └── BudgetRule — Schedule or Performance automation
```

## Data Flow

```
User Action → Component → Store Slice → Engine Function → New State → Component Re-render
```

### State Management
- **Zustand Store**: Single source of truth for UI state
- **8 Core Slices**: Target, AdGroup, Negative, Budget, Portfolio, Draft, Core, Query
- **7 Feature Slices**: Drills, Profiles, Trainer, Bulk, Reports, Missions, Integrity
- **Persistence**: LocalStorage via Zustand persist middleware
- **Cloud Sync**: Optional database persistence via API routes
- **Persistence**: LocalStorage via Zustand persist middleware
- **Cloud Sync**: Optional database persistence via API routes

### Server-Side Data Flow
```
Component → API Route → Prisma Client → SQLite Database
     ↓
Component ← API Response ← Prisma Query Result
```

## Authentication & Authorization

### NextAuth Configuration
- **Provider**: Credentials (email/password)
- **Session Strategy**: JWT
- **Password Hashing**: bcryptjs
- **Database**: SQLite via Prisma

### API Route Protection
All `/api/*` routes check for valid session:
```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Data Isolation
Each user's campaigns are isolated by `userId`:
```typescript
const campaigns = await prisma.campaign.findMany({
  where: { userId: session.user.id },
});
```

## Database Schema

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  campaigns     Campaign[]
  simulations   Simulation[]
}
```

### Campaign Model
```prisma
model Campaign {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaignId    String    // Original campaign ID from the engine
  type          String    // SP, SB, SD
  name          String
  // ... all campaign fields
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([userId, campaignId])
}
```

## Responsive Design

### Breakpoint System
- **Mobile**: < 768px — Single column, hamburger menu, touch-optimized
- **Tablet**: 768-1100px — Condensed sidebar, adapted spacing
- **Desktop**: > 1100px — Full layout with sidebar

### Mobile-First Approach
- All components designed for mobile first
- Progressive enhancement for larger screens
- Touch targets minimum 48px
- Safe area padding for iPhone notch

## Testing Strategy

### Unit Tests
- **Location**: `src/engine/ad-console/core/__tests__/` + `tests/engine.test.ts`
- **Framework**: Vitest
- **Coverage**: 446 tests across 27 test files
- **Principle**: TDD — write failing test first
- **Strategy**: Red-Green-Refactor cycle with SOLID compliance gates

### Integration Tests
- **Location**: `src/components/AdConsole/__tests__/`
- **Framework**: Vitest + React Testing Library
- **Coverage**: Component behavior tests

### E2E Tests
- **Location**: `e2e/`
- **Framework**: Playwright
- **Coverage**: Critical user flows

## Performance Considerations

### Client-Side
- Zustand selectors for minimal re-renders
- React.memo for expensive components
- Virtual scrolling for large lists (planned)

### Server-Side
- Prisma connection pooling
- JWT sessions (no database lookup per request)
- Static generation for landing pages

### Database
- Postgres (production via Vercel Postgres, local via Docker or pg)
- Connection pooling via Prisma
- Indexes on frequently queried fields

## Security

### Authentication
- Password hashing with bcrypt (10 rounds)
- JWT tokens with secure HTTP-only cookies
- Session expiration via NextAuth

### Authorization
- User data isolation via userId foreign key
- API route protection via session checks
- No cross-user data access

### Input Validation
- Server-side validation on all API routes
- Client-side validation for UX
- SQL injection prevention via Prisma ORM

## Deployment

### Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Production Considerations
- Rate limiting on API routes
- CSRF protection
- Logging and monitoring
- Connection pooling for Postgres
