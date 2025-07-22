FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install  # ✅ This line must be uncommented

COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]