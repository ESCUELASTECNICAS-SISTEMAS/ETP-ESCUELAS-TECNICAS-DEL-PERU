## Multi-stage Dockerfile for building Vite React app and serving with nginx
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies (use package-lock.json if present)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Remove default nginx config and optionally add a simple config
RUN rm /etc/nginx/conf.d/default.conf || true
COPY --chown=nginx:nginx /usr/share/nginx/html /usr/share/nginx/html

EXPOSE 80
CMD ["/bin/sh", "-c", "nginx -g 'daemon off;' "]
