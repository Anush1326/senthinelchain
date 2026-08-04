# ── SentinelChain Express API Server ──
# Multi-stage build: Node.js 20 Alpine

FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies only (cache layer)
COPY package.json ./
RUN npm install --omit=dev

# Copy application source
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p /app/uploads /app/src/data

# Expose API port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/evidence || exit 1

# Run the server
CMD ["node", "src/index.js"]
