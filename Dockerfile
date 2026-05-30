# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies) for build
RUN npm ci

# Copy application source
COPY . .

# Build the Astro SSR application
RUN npm run build

# Stage 2: Install production dependencies only
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Stage 3: Runtime image
FROM node:22-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose the server port
EXPOSE 3000

# Copy runtime dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy built application output
COPY --from=builder /app/dist ./dist

# Start the server
CMD ["node", "dist/server/entry.mjs"]
