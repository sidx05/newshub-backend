# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache bash git

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm install -g typescript
RUN tsc

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/public ./public  # <-- remove this

RUN mkdir -p logs

RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
USER backend

EXPOSE 3001

CMD ["node", "dist/index.js"]
