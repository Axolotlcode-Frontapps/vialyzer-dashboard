# Use the smallest possible Node image
FROM node:18-alpine AS build
WORKDIR /app

# Install bun from binary (fastest and smallest)
ADD https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64.zip /tmp/bun.zip
RUN cd /tmp && unzip bun.zip && mv bun-linux-x64/bun /usr/local/bin/ && rm -rf /tmp/*

# Copy only package files first (better caching)
COPY package.json bun.lockb* ./

# Install with aggressive optimizations
RUN bun install --production --no-cache --no-save \
    && rm -rf /root/.bun/install/cache \
    && rm -rf /tmp/*

# Copy source
COPY . .

# Build and clean in same layer
RUN bun run build \
    && rm -rf node_modules \
    && rm -rf src \
    && rm -rf /root/.bun \
    && rm -rf /tmp/*

# Production stage - ultra minimal
FROM node:18-alpine
WORKDIR /app

# Install serve and clean immediately
RUN npm install -g serve \
    && npm cache clean --force \
    && rm -rf /root/.npm \
    && rm -rf /tmp/*

# Copy only built files
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]