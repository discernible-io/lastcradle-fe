# Builder compiles the SPA. Runtime is nginx (+ tiny Node OG inject on localhost).
FROM node:20-alpine AS builder
WORKDIR /app

# main | development — tier for .env.* selection (do not set NODE_ENV to these; Vite build needs production).
ARG APP_BUILD_ENV=main
ENV APP_BUILD_ENV=${APP_BUILD_ENV}

COPY package*.json ./
COPY scripts/ scripts/
RUN npm ci

COPY . .
RUN npm run validate:env && npm run env:sync && npm run build \
  && node scripts/write-og-runtime-env.mjs

# Pinned base (tag + manifest-list digest). Bump both when upgrading nginx.
FROM docker.io/nginx:1.31.0-alpine@sha256:f105e3f12187c58ddc3acd09bbe4b9e4a9ab1df855d3d0e511b641077b5e988e

ARG NODE_ENV=main

RUN apk add --no-cache openssl nodejs && \
    rm /etc/nginx/conf.d/default.conf && \
    mkdir -p /app/certs /app/server /app/shared /usr/share/nginx/html

COPY nginx/nginx.${NODE_ENV}.conf /etc/nginx/nginx.conf
COPY nginx/security-headers-common.inc /etc/nginx/security-headers-common.inc
COPY nginx/docker-entrypoint.sh /docker-entrypoint-og.sh
COPY server/og-inject.mjs /app/server/og-inject.mjs
COPY shared/recapHeadline.mjs /app/shared/recapHeadline.mjs
COPY --from=builder /app/server/og-runtime.json /app/server/og-runtime.json
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

RUN chmod +x /docker-entrypoint-og.sh && \
    chown -R nginx:nginx /etc/nginx/nginx.conf /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /app /usr/share/nginx/html /docker-entrypoint-og.sh

USER nginx
EXPOSE 443

CMD ["/docker-entrypoint-og.sh"]
