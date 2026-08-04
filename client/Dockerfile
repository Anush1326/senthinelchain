# ── SentinelChain React Client ──
# Multi-stage build: Vite build → nginx:alpine

# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cache layer)
COPY package.json ./
RUN npm install

# Copy source and build
COPY . .

# Set build-time environment variables
ARG VITE_API_URL=/api
ARG VITE_CONTRACT_ADDRESS=0x1111111111111111111111111111111111111111
ARG VITE_CHAIN_ID=80002

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CONTRACT_ADDRESS=$VITE_CONTRACT_ADDRESS
ENV VITE_CHAIN_ID=$VITE_CHAIN_ID

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
