# Multi-User Authentication Guide

This document covers the multi-user access system for the Amazon Ad Console Training Simulator.

## Overview

The application supports multiple users with isolated campaign data. Each user can:
- Register with email/password
- Login/logout securely
- Save campaigns to the database
- Load campaigns from any device
- Maintain separate training progress

## Architecture

### Components

1. **NextAuth v5** — Authentication provider
2. **Prisma** — Database ORM
3. **SQLite** — Local development database
4. **JWT Sessions** — Stateless session management

### Database Schema

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

model Campaign {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaignId    String
  type          String
  name          String
  // ... all campaign fields as JSON
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([userId, campaignId])
}
```

## Setup

### 1. Install Dependencies

```bash
npm install prisma @prisma/client next-auth bcryptjs
npm install -D @types/bcryptjs
```

### 2. Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

### 3. Configure Environment Variables

Create `.env` file:

```env
# Prisma
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## API Routes

### Authentication

#### Register User
```
POST /api/auth/register
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

Validation: `email` must be a valid address; `password` must be at least
8 characters. Invalid input returns `400`.

Response:
```json
{
  "message": "User created",
  "userId": "clx1234567890"
}
```

#### Login
NextAuth handles login via:
```
POST /api/auth/[...nextauth]
```

### Campaign Management

All campaign routes address campaigns by their **engine campaign id**
(e.g. `C-SP-123456`) — the same id shown in the UI — and are scoped to the
authenticated user. Validation errors return `400`, missing campaigns `404`,
duplicate ids `409`.

#### List Campaigns
```
GET /api/campaigns
```

Returns all campaigns for the authenticated user, in full engine shape
(ad groups, targets, search terms, negatives, product ads, ads, history).

#### Create Campaign
```
POST /api/campaigns
```

Request body is an engine `Campaign` (or partial — missing fields are
normalized to engine defaults):
```json
{
  "id": "C-SP-123456",
  "type": "SP",
  "name": "My Campaign",
  "dailyBudget": 25,
  "defaultBid": 0.75
}
```

Constraints: `name` required, `type` one of `SP|SB|SD`, `dailyBudget ≥ 1`,
`defaultBid ≥ 0.02`.

#### Get / Update / Delete Campaign
```
GET    /api/campaigns/[id]
PATCH  /api/campaigns/[id]   (partial update; PUT kept as an alias)
DELETE /api/campaigns/[id]
```

### Data Sync

When signed in, the app auto-syncs: the store hydrates from `GET /api/sync`
on login and pushes changes (debounced) to `POST /api/sync`. See
`src/lib/cloud-sync.ts`.

#### Sync All Campaigns
```
POST /api/sync
```

Request body:
```json
{
  "campaigns": [...]
}
```

Upserts every campaign and prunes campaigns absent from the payload, in a
single transaction. Returns `{ "synced": n, "campaigns": [...] }`.

#### Load All Campaigns
```
GET /api/sync
```

### Simulation

#### Run Server-Side Simulation
```
POST /api/simulate
```

Request body: `{ "days": 7 }` (integer 1–90, default 7). Runs the engine's
day simulation over the user's campaigns on the server, persists the results,
records an audit row in the `Simulation` table, and returns
`{ "days": n, "campaigns": [...] }`.

## Frontend Components

### SessionProvider
Wraps the app to provide session context:

```tsx
// src/components/SessionProvider.tsx
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
```

### UserMenu
Displays user info and logout:

```tsx
// src/components/UserMenu.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';

export function UserMenu() {
  const { data: session, status } = useSession();
  
  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/auth/login">Sign in</Link>
        <Link href="/auth/register">Sign up</Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => signOut({ callbackUrl: '/' })}>
        Sign out
      </button>
    </div>
  );
}
```

### SyncButton
Handles cloud sync:

`SyncButton` (`src/components/SyncButton.tsx`) renders the sync status plus
manual Save/Load buttons. The actual sync logic lives in the `useCloudSync`
hook (`src/lib/cloud-sync.ts`): on login it hydrates the store from
`GET /api/sync` (or seeds the server from local state on first login), then
auto-saves campaign changes to `POST /api/sync` with a 2-second debounce.

## Pages

### Login Page
`/auth/login` — Email/password login form

### Register Page
`/auth/register` — New user registration form

### Landing Page
`/landing` — Public landing page with login/register links

## Security Considerations

### Password Hashing
- Uses bcryptjs with 10 salt rounds
- Never store plaintext passwords

### JWT Sessions
- Stateless authentication
- Tokens stored in HTTP-only cookies
- Configurable expiration

### Data Isolation
- Each user's data filtered by `userId`
- API routes verify ownership before operations
- No cross-user data access

### Input Validation
- Server-side validation on all endpoints
- Email format validation
- Password strength requirements (minimum 8 characters)

## Production Deployment

### Database
Replace SQLite with a production database:

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/adconsole"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/adconsole"
```

### Environment Variables
```env
DATABASE_URL="your-production-db-url"
NEXTAUTH_SECRET="strong-random-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Security Checklist
- [ ] Use strong NEXTAUTH_SECRET (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags
- [ ] Add rate limiting to auth endpoints
- [ ] Implement CSRF protection
- [ ] Add account lockout after failed attempts
- [ ] Enable email verification (optional)

## Troubleshooting

### Common Issues

**"Invalid email or password"**
- Check if user exists in database
- Verify password hash is correct
- Check for typos in email

**"Unauthorized" error**
- Ensure user is logged in
- Check JWT token expiration
- Verify NEXTAUTH_SECRET is set

**Database connection errors**
- Run `npx prisma migrate dev`
- Check DATABASE_URL in .env
- Verify SQLite file exists

### Debug Mode
Enable NextAuth debug logging:

```env
NEXTAUTH_DEBUG=true
```

## Future Enhancements

- [ ] OAuth providers (Google, GitHub)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Team/organization support
- [ ] Role-based access control
