# Builder compiles the SPA. Runtime is nginx (+ tiny Node OG inject on localhost).
# Node 20 has no CVE-2026-111497 fix. 22.23.4 is the fixed 22.x line.
FROM node:22.23.4-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914 AS builder
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
FROM docker.io/nginx:1.31.7-alpine@sha256:892bb2152464f0c5d8972593a5f5afaf8054552580b699d95f8ff4af08c2d33d

ARG NODE_ENV=main

# CVE-2026-111497: Alpine nodejs links libbrotlidec. The nginx base still ships
# brotli-libs 1.2.0, so the Node package and the library are both pinned.
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache openssl 'nodejs>=24.22.1-r0' 'brotli-libs>=1.2.1-r0' 'libcrypto3>=3.5.8-r0' 'libssl3>=3.5.8-r0' && \
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
EXPOSE 13443

CMD ["/docker-entrypoint-og.sh"]
