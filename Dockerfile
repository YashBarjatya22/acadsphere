# Multi-stage Dockerfile for AcadSphere Full-Stack App
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

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

# Copy all application and configuration files from builder
COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--port", "3000", "--host", "0.0.0.0"]
