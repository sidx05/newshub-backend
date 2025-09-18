# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install bash and git
RUN apk add --no-cache bash git

# Copy package files and install all dependencies (dev + prod)
COPY package*.json ./
RUN npm ci

# ✅ Copy Prisma folder before generating client
COPY prisma ./prisma

# ✅ Generate Prisma client (must happen before copying the rest of the app)
RUN npx prisma generate

# Copy rest of the source code
COPY . .

# Install TypeScript globally
RUN npm install -g typescript

# Compile TypeScript to JavaScript
RUN tsc


# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# ✅ Copy Prisma schema folder and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Optional: logs folder
RUN mkdir -p logs

# Set up non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
USER backend

EXPOSE 3001

CMD ["node", "dist/index.js"]
