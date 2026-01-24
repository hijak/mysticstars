# MysticStars Scheduler Service
# Build from project root: docker build -f scheduler/Dockerfile -t mysticstars-scheduler .

FROM node:20-alpine AS base

# Install dependencies for both scheduler and backend scripts
FROM base AS deps

WORKDIR /app

# Copy scheduler package files
COPY scheduler/package*.json ./scheduler/

# Copy backend package files (needed for scripts)
COPY backend/package*.json ./backend/

# Install scheduler dependencies
WORKDIR /app/scheduler
RUN npm ci --omit=dev

# Install backend dependencies (for scripts to work)
WORKDIR /app/backend
RUN npm ci --omit=dev

# Production stage
FROM base AS runner

# Add labels
LABEL org.opencontainers.image.source="https://github.com/jcowey/mysticstars"
LABEL org.opencontainers.image.description="MysticStars Scheduler Service"

# Create non-root user
RUN addgroup -g 1001 -S scheduler && \
    adduser -S scheduler -u 1001 -G scheduler

WORKDIR /app

# Copy scheduler node_modules and source
COPY --from=deps /app/scheduler/node_modules ./node_modules
COPY scheduler/package*.json ./
COPY scheduler/src/ ./src/

# Copy backend scripts, services, and their dependencies
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend/scripts/ ./backend/scripts/
COPY backend/services/ ./backend/services/
COPY backend/package.json ./backend/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002
ENV SCRIPTS_PATH=/app/backend/scripts

# Expose dashboard port
EXPOSE 3002

# Switch to non-root user
USER scheduler

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

# Start the scheduler
CMD ["node", "src/index.js"]
