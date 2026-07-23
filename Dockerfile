# ---- Build Stage ----
# Produces a self-contained Next.js standalone bundle in /app/.next/standalone.
# Requires next.config.ts to set `output: 'standalone'` (audit H-12).
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (postinstall runs `prisma generate`).
COPY package.json package-lock.json ./
RUN npm ci

# Prisma schema and migrations are required for `prisma generate` to succeed
# in the postinstall hook. Without this COPY, the postinstall step crashes
# with "prisma/schema.prisma not found".
COPY prisma/ ./prisma/

# Project source
COPY tsconfig.json next.config.ts ./
COPY src/ ./src/
COPY public/ ./public/

# Build the standalone bundle
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for runtime
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone bundle emits a server.js entry point and a `.next/static/` dir
# for client assets. Both must be copied from the builder stage.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
