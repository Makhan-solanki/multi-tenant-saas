# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Expose port (assuming 3002)
EXPOSE 3002

# Start API service
CMD ["node", "index.js"]
