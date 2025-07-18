# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve with Vite Preview
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install -g vite

# Expose port used by `vite preview`
EXPOSE 4173

CMD ["vite", "preview", "--port", "4173"]
