# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source files
COPY . .

# Expose auth port (assuming 3001)
EXPOSE 3001

# Start Auth service
CMD ["node", "index.js"]
