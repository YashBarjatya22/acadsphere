# Multi-stage Dockerfile for AcadSphere Full-Stack App
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build client and server bundles
ENV NODE_ENV=production
RUN npm run build

# Runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/local.db ./local.db

EXPOSE 3000

CMD ["node", "dist/server/server.js"]
