# Builder compiles the SPA. Production is nginx only (no Node, npm, or serve).
FROM node:20-alpine AS builder
WORKDIR /app

# main | development — tier for .env.* selection (do not set NODE_ENV to these; Vite build needs production).
ARG APP_BUILD_ENV=main
ENV APP_BUILD_ENV=${APP_BUILD_ENV}

COPY package*.json ./
COPY scripts/ scripts/
RUN npm ci

COPY . .
RUN npm run validate:env && npm run env:sync && npm run build

# Pinned base (tag + manifest-list digest). Bump both when upgrading nginx.
FROM docker.io/nginx:1.31.0-alpine@sha256:f105e3f12187c58ddc3acd09bbe4b9e4a9ab1df855d3d0e511b641077b5e988e

ARG NODE_ENV=main

RUN apk add --no-cache openssl && \
    rm /etc/nginx/conf.d/default.conf && \
    mkdir -p /app/certs /usr/share/nginx/html

COPY nginx/nginx.${NODE_ENV}.conf /etc/nginx/nginx.conf
COPY nginx/security-headers-common.inc /etc/nginx/security-headers-common.inc
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /etc/nginx/nginx.conf /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /app /usr/share/nginx/html

USER nginx
EXPOSE 13443

CMD ["nginx", "-g", "daemon off;"]
