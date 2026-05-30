# syntax=docker/dockerfile:1.7

# Stage 1: Build the application and prepare production dependencies
FROM node:22-alpine AS builder
WORKDIR /app

ENV CYPRESS_INSTALL_BINARY=0

# Configure npm registry mirror
RUN npm config set registry https://repo.hmirror.ir/npm

# Copy package files
COPY package*.json ./

# Replace registry in package-lock.json to use the mirror
RUN sed -i 's#https://registry.npmjs.org/#https://repo.hmirror.ir/npm/#g' package-lock.json

# Install all dependencies (including devDependencies) for build using caching
RUN --mount=type=cache,target=/root/.npm \
    npm ci --registry=https://repo.hmirror.ir/npm

# Copy application source
COPY . .

# Build the Astro SSR application
RUN npm run build

# Prune devDependencies to keep only production dependencies in node_modules
RUN npm prune --omit=dev


# Stage 2: Runtime image
FROM node:22-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose the server port
EXPOSE 3000

# Copy production node_modules and built output from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

# Start the server
CMD ["node", "dist/server/entry.mjs"]
