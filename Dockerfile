# road-to-hor-2027 — Vite static site (Docker Desktop / Node LTS)
# Targets: development (hot reload), build (dist), preview (production-like serve)

FROM node:22-bookworm-slim AS development
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY docker/entrypoint-dev.sh /usr/local/bin/entrypoint-dev.sh
RUN chmod +x /usr/local/bin/entrypoint-dev.sh
COPY . .
EXPOSE 5173
ENTRYPOINT ["/usr/local/bin/entrypoint-dev.sh"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS preview
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=build /app/dist ./dist
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
