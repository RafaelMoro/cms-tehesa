# syntax=docker/dockerfile:1

# ---- deps: full install, needs build toolchain for sharp/better-sqlite3 ----
FROM node:22-alpine AS deps
RUN apk add --no-cache build-base python3 vips-dev
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: compile server TS + admin panel ----
FROM deps AS build
ENV NODE_ENV=production
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:22-alpine AS runtime
RUN apk add --no-cache vips postgresql-client
ENV NODE_ENV=production
WORKDIR /opt/app

COPY --from=build /opt/app/node_modules ./node_modules
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/build ./build
COPY --from=build /opt/app/public ./public
COPY --from=build /opt/app/package.json ./package.json
COPY --from=build /opt/app/favicon.png ./favicon.png

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337
CMD ["npm", "run", "start"]
