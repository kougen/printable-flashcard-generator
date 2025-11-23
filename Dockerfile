FROM oven/bun:1 AS base
WORKDIR /app

ENV NODE_ENV=production

#RUN apt-get update \
#  && apt-get install -y --no-install-recommends openssl \
#  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json bun.lockb* ./

RUN bun install --ci

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun db:generate

RUN bunx next build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system nextjs \
  && adduser --system --ingroup nextjs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "bun db:deploy && bun server.js"]
