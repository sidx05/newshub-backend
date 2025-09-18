# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install bash and git (needed for some build tools)
RUN apk add --no-cache bash git

# Copy package files and install all dependencies (dev + prod)
COPY package*.json ./
RUN npm ci

# ✅ Copy Prisma folder before generating client
COPY prisma ./prisma

# ✅ Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Install TypeScript globally
RUN npm install -g typescript

# ✅ Compile TypeScript to JavaScript
RUN tsc

# ✅ Manually copy swagger.yaml into dist/config
RUN mkdir -p dist/config
RUN cp src/config/swagger.yaml dist/config/swagger.yaml


# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# ✅ Copy compiled app
COPY --from=builder /app/dist ./dist

# ✅ Copy Prisma files and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Optional: logs folder
RUN mkdir -p logs

# ✅ Create non-root user for better security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
USER backend

# Application port
EXPOSE 3001

# ✅ Start application
CMD ["node", "dist/index.js"]
