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
3. **Postgres** — Database (via `@prisma/adapter-neon`), used in every environment
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
npm install prisma @prisma/client @prisma/adapter-neon @neondatabase/serverless next-auth bcryptjs
npm install -D @types/bcryptjs
```

### 2. Initialize Prisma

```bash
npx prisma init --datasource-provider postgresql
```

### 3. Configure Environment Variables

Create `.env` file:

```env
# Prisma (Postgres — e.g. from Vercel Storage → Postgres, or Neon directly)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth/Auth.js session secret — generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-key-here"
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

#### List Campaigns
```
GET /api/campaigns
```

Returns all campaigns for the authenticated user.

#### Create Campaign
```
POST /api/campaigns
```

Request body:
```json
{
  "campaignId": "C-SP-123456",
  "type": "SP",
  "name": "My Campaign",
  "dailyBudget": 25,
  "defaultBid": 0.75
}
```

#### Update Campaign
```
PUT /api/campaigns/[id]
```

#### Delete Campaign
```
DELETE /api/campaigns/[id]
```

### Data Sync

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

#### Load All Campaigns
```
GET /api/sync
```

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

```tsx
// src/components/SyncButton.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useAdConsoleStore } from '@/engine/ad-console/store';

export function SyncButton() {
  const { data: session } = useSession();
  
  const handleSync = async (direction: 'upload' | 'download') => {
    if (direction === 'upload') {
      const state = useAdConsoleStore.getState().state;
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaigns: state.campaigns }),
      });
    } else {
      const response = await fetch('/api/sync');
      const campaigns = await response.json();
      useAdConsoleStore.setState((s) => ({
        state: { ...s.state, campaigns },
      }));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => handleSync('upload')}>↑ Save</button>
      <button onClick={() => handleSync('download')}>↓ Load</button>
    </div>
  );
}
```

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
- Password strength requirements (minimum 6 characters)

## Production Deployment

### Database
`prisma/schema.prisma` declares the `postgresql` datasource provider, used in every environment, not just production. The runtime connection (`DATABASE_URL` plus the `@prisma/adapter-neon` driver adapter) is wired up separately in `prisma.config.ts` / `src/lib/prisma.ts`, not in the schema itself — see `.env.example`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

### Environment Variables
```env
DATABASE_URL="your-postgres-connection-string"
AUTH_SECRET="strong-random-secret"   # generate with: openssl rand -base64 32
```

### Security Checklist
- [ ] Use strong AUTH_SECRET (32+ characters)
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
- Verify AUTH_SECRET is set

**Database connection errors**
- Local development: run `npx prisma migrate dev` to apply pending migrations
- Production: run `npx prisma migrate deploy` instead (`migrate dev` is dev-only — it can prompt interactively and isn't safe for CI/deploy pipelines)
- Check DATABASE_URL in .env points at a reachable Postgres instance

### Debug Mode
Enable NextAuth debug logging:

```env
AUTH_DEBUG=true
```

## Future Enhancements

- [ ] OAuth providers (Google, GitHub)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Team/organization support
- [ ] Role-based access control
