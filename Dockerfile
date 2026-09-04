# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm install --verbose

COPY . .

# VITE_API_URL must be passed at build time:
#   podman build --build-arg VITE_API_URL=https://standbase.shivankkapoor.com .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
# nginx-unprivileged runs as uid 101 (non-root) on port 8080
FROM docker.io/nginxinc/nginx-unprivileged:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
