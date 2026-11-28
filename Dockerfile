# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm install --verbose

COPY . .

# VITE_API_URL must be passed at build time:
#   docker build --build-arg VITE_API_URL=https://standbase.shivankkapoor.com .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
# nginx-unprivileged runs as uid 101 (non-root) on port 8080
FROM nginx:1.30-alpine AS runner

# Pick up Alpine security fixes released after the base image was built
RUN apk upgrade --no-cache

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
