FROM oven/bun:debian AS build

WORKDIR /app

RUN bun i -g serve

COPY package.json .
RUN bun install

COPY . .
RUN bun run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]