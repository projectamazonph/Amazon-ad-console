# Technical Specifications

## Runtime Requirements

| Requirement | Version |
|------------|---------|
| Node.js | ≥ 18.0 |
| npm | ≥ 9.0 |
| TypeScript | ~5.8 |

## Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^16.0.0 | React framework (App Router) |
| `react` | ^19.0.0 | UI library |
| `react-dom` | ^19.0.0 | React DOM renderer |
| `zustand` | ^5.0.0 | State management |
| `@prisma/client` | ^5.0.0 | Database ORM |
| `next-auth` | ^5.0.0-beta.31 | Authentication |
| `bcryptjs` | ^2.4.3 | Password hashing |
| `motion` | ^11.0.0 | Animation library |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/node` | ^22.0.0 | Node.js type definitions |
| `@types/react` | ^19.0.0 | React type definitions |
| `@types/react-dom` | ^19.0.0 | ReactDOM type definitions |
| `@types/bcryptjs` | ^2.4.0 | bcryptjs type definitions |
| `typescript` | ~5.8.0 | TypeScript compiler |
| `prisma` | ^5.0.0 | Prisma CLI |
| `vitest` | ^4.1.10 | Test runner |
| `@vitest/coverage-v8` | ^4.1.10 | Code coverage |
| `@playwright/test` | ^1.61.1 | E2E testing |
| `@testing-library/react` | ^16.3.2 | React testing utilities |
| `@testing-library/user-event` | ^14.6.1 | User interaction simulation |
| `jsdom` | ^29.1.1 | DOM implementation for tests |

**Total runtime dependency count: 8** (next, react, react-dom, zustand, @prisma/client, next-auth, bcryptjs, motion)

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Key settings:
- **strict mode**: All strict type-checking options enabled
- **ES2022 target**: Modern JavaScript output
- **Bundler resolution**: Compatible with Next.js bundler
- **Path alias**: `@/*` maps to `./src/*`

## Next.js Configuration

```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
};
```

Minimal configuration. No custom webpack, no env files, no middleware.

## Database Configuration

### Prisma Schema
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

### Environment Variables
```env
# Prisma
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Commands
```bash
npx prisma init --datasource-provider sqlite
npx prisma migrate dev --name init
npx prisma generate
npx prisma db push
```

## File Statistics

| Directory | Files | Total Lines |
|-----------|-------|------------|
| `src/engine/ad-console/core/` | 3 | ~800 |
| `src/engine/ad-console/features/` | 21 | ~1,800 |
| `src/engine/ad-console/` (root) | 4 | ~220 |
| `src/components/AdConsole/` | 15 | ~1,800 |
| `src/components/` (root) | 3 | ~200 |
| `src/app/` | 8 | ~1,200 |
| `src/lib/` | 4 | ~300 |
| `prisma/` | 2 | ~100 |
| **Total src/** | **60+** | **~7,500** |

### Source File Breakdown

| File | Lines | Responsibility |
|------|-------|---------------|
| `globals.css` | 1,377 | Design system tokens + responsive styles |
| `store.ts` | 250 | Zustand root store composition |
| `engine.ts` | 600 | Core business logic functions |
| `types.ts` | 200 | Domain interfaces |
| `scenarios.ts` | 400 | Training data & product catalog |
| `CampaignManager.tsx` | 300 | Campaign list + filters |
| `CampaignDetail.tsx` | 550 | Single campaign deep-dive |
| `CreateCampaignWizard.tsx` | 200 | Multi-step creation flow |
| `MobileNav.tsx` | 133 | Mobile drawer navigation |
| `auth.ts` | 80 | NextAuth configuration |
| `prisma.ts` | 15 | Prisma client singleton |

## Testing Configuration

### Vitest Config
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

### Test Commands
```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
npm run test:e2e   # Playwright E2E tests
```

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |
| Total Bundle Size | < 500KB |

## Security Configuration

### Authentication
- Password hashing: bcrypt (10 salt rounds)
- Session strategy: JWT
- Cookie flags: HTTP-only, Secure, SameSite=Lax

### Database
- User data isolation via userId foreign key
- Cascade deletes for user data
- Unique constraints on user email and campaign IDs

### API Routes
- Session validation on all protected routes
- Input validation on all endpoints
- Rate limiting (planned)

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
DATABASE_URL="postgresql://user:password@host:5432/db"
NEXTAUTH_SECRET="strong-random-secret"
NEXTAUTH_URL="https://your-domain.com"
```
