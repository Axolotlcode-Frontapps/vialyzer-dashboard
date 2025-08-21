FROM oven/bun:latest AS build
WORKDIR /app

RUN curl -fsSL https://bun.sh/install | bash
         

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:latest AS production
WORKDIR /app

RUN bun add -g serve

COPY --from=build /app/dist ./dist
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]