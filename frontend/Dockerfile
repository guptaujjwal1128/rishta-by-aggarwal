FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html

ENV PORT=8080
ENV VITE_API_URL=
ENV VITE_GOOGLE_CLIENT_ID=

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
