# front/Dockerfile

# ---------- Dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Image finale ----------
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Nuxt build en mode SSR génère un dossier .output autonome
COPY --from=build /app/.output ./.output

RUN addgroup -g 1001 -S nodejs && adduser -S nuxt -u 1001
USER nuxt

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
