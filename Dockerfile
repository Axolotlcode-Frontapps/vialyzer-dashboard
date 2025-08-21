# Alternative: Use Node.js which is more space-efficient in CI
FROM node:22-alpine AS build
WORKDIR /app

RUN curl -fsSL https://bun.sh/install | bash

COPY package.json bun.lockb* ./
RUN bun install --no-cache --frozen-lockfile

COPY . .
RUN bun run build

FROM node:22-alpine
WORKDIR /app

RUN bun add -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]