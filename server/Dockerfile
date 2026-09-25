# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---------- Production stage ----------
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Compiled output.
COPY --from=build /app/dist ./dist

# Kept as source (not compiled): swagger-jsdoc reads the @swagger JSDoc
# comments straight out of these .ts files at runtime (docs/swagger.ts's
# `apis` glob), and sequelize-cli reads migrations/config directly.
COPY --from=build /app/routes ./routes
COPY --from=build /app/pgRoutes ./pgRoutes
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/config ./config
COPY --from=build /app/.sequelizerc ./.sequelizerc

RUN mkdir -p uploads/avatars

EXPOSE 3002

CMD ["node", "dist/server.js"]
