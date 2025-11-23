FROM oven/bun:1 AS base
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json bun.lockb* ./

RUN bun install --ci

FROM base AS builder

ARG DATABASE_URL="postgresql://user:pass@localhost:5432/dummy"
ENV DATABASE_URL=$DATABASE_URL

ARG BETTER_AUTH_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun db:generate

RUN bun run build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system nextjs \
  && adduser --system --ingroup nextjs nextjs \
  && mkdir -p /app/storage/pdfs \
  && chown -R nextjs:nextjs /app

#COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY /prisma.config.ts ./prisma.config.ts

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "bun db:deploy && bun start"]
