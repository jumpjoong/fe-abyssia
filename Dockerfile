# ── 1단계: 빌드 ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 먼저 복사 (캐시 최적화)
COPY package.json package-lock.json* ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .

# 환경변수 빌드 시 주입
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_REOWN_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_REOWN_ID=$NEXT_PUBLIC_REOWN_ID

RUN npm run build

# ── 2단계: 실행 ──────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 필요한 파일만 복사 (이미지 경량화)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
