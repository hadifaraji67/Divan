# ═══════════════════════════════════════════════════════════
#  Dockerfile برای سرور دیوان
# ═══════════════════════════════════════════════════════════

FROM node:20-alpine

WORKDIR /app

# ─── Dependencies ───
COPY package*.json ./
RUN npm ci --only=production

# ─── Source ───
COPY src/ ./src/
COPY migrations/ ./migrations/ 2>/dev/null || true

# ─── User ───
RUN addgroup -S divan && adduser -S divan -G divan
RUN mkdir -p /app/logs && chown -R divan:divan /app
USER divan

# ─── Port ───
EXPOSE 4000

# ─── Healthcheck ───
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O- http://127.0.0.1:4000/api/health || exit 1

# ─── Start ───
CMD ["node", "src/index.js"]
