# ---- Stage 1: build the Angular app ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching).
COPY package*.json ./
RUN npm ci

# Build the production bundle.
COPY . .
RUN npm run build

# ---- Stage 2: serve the static files with nginx ----
FROM nginx:alpine
# SPA-aware nginx config (fallback to index.html).
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular 21 (@angular/build:application) emits into dist/frontend/browser.
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
