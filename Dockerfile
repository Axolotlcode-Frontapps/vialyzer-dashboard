FROM oven/bun:debian AS build
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:debian AS production
WORKDIR /app

RUN bun add -g serve

COPY --from=build /app/dist ./dist

RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]