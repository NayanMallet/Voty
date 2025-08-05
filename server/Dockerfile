# Base image
FROM node:20-alpine

# Set working dir
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.6.2

# Copy files and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy everything else
COPY . .

# Build TypeScript
RUN pnpm run build

# Expose port
EXPOSE 3000

# Run compiled app
CMD ["node", "dist/index.js"]
