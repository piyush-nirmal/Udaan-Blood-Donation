# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Pass build arguments
ARG VITE_USE_MOCK="false"
ARG VITE_API_URL="/api"
ARG VITE_GOOGLE_MAPS_KEY=""
ARG VITE_RAZORPAY_KEY="rzp_test_udaan_demo"

ENV VITE_USE_MOCK=$VITE_USE_MOCK \
    VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_MAPS_KEY=$VITE_GOOGLE_MAPS_KEY \
    VITE_RAZORPAY_KEY=$VITE_RAZORPAY_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage: Serve static files with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Minimal SPA fallback configuration
RUN printf 'server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

