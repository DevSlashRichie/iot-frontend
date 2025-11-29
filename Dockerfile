# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and lock files
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies (prefer npm if package-lock.json exists, else bun if bun.lock exists)
# Since both exist in the file list, we'll check which one to use. 
# package.json has package-lock.json, so we use npm ci.
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/caddy

# Copy the Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
