# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code and build
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend and backend code
COPY --from=builder /app/dist ./dist
COPY server ./server

# Ensure volume directories for database and uploads exist
RUN mkdir -p server/uploads

# Expose backend port
EXPOSE 5001

# Start the application
CMD ["npm", "run", "start"]
