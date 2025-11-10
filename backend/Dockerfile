FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-bullseye-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create directories for uploads and exports
RUN mkdir -p uploads exports

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
