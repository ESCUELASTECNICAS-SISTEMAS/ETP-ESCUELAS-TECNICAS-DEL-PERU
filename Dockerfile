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
# Copy build output from the build stage and set ownership to the nginx user
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf || true

EXPOSE 80
CMD ["/bin/sh", "-c", "nginx -g 'daemon off;' "]
