# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production server using 'serve'
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 4173

# Serve as SPA with fallback to index.html
CMD ["serve", "-s", "dist", "-l", "4173"]