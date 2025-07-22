FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install  # ✅ This line must be uncommented

COPY . .

EXPOSE 3002

CMD ["node", "src/server.js"]