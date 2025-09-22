# --- Stage 1: Builder ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including devDependencies for Prisma CLI
RUN npm install

# Copy Prisma schema and .env for Prisma generate
COPY prisma ./prisma/
COPY .env ./.env 
#Temporarily copy .env for prisma generate

# Generate Prisma client with specific binary targets for Docker
# This ensures the correct Prisma client is built for the Alpine Linux environment
RUN npx prisma generate --schema=./prisma/schema.prisma

# Remove .env after generation (optional, but good practice if it contains sensitive data)
RUN rm ./.env

# --- Stage 2: Production ---
FROM node:18-alpine

WORKDIR /app

# Copy only production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy the rest of your application source code
COPY . .

# Expose the port your Express app listens on
EXPOSE 3000

# Set environment variables (these will be overridden by docker-compose.yml)
# These are fallback values if running with `docker run` directly without -e flags
ENV NODE_ENV=production
ENV PORT=3000

# Command to run your application (overridden by docker-compose.yml)
# This is a fallback if you run the image directly without docker-compose
CMD ["npm", "start"]