# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install bash/git for convenience
RUN apk add --no-cache bash git

# Copy package files
COPY package*.json ./

# Install all dependencies (dev + prod) for building
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Install TypeScript globally to run tsc
RUN npm install -g typescript

# Build TypeScript
RUN tsc

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy only package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma client generated files (optional, but safe)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
USER backend

# Expose port (Render injects PORT automatically)
EXPOSE 3001

# Start the backend
CMD ["node", "dist/index.js"]