FROM node:22.0.0-alpine AS image
WORKDIR /app
COPY ./package.json .
ENV PORT=3006

FROM image AS build
RUN npm install --legacy-peer-deps --mode=development --ignore-scripts
COPY . .
RUN ./node_modules/.bin/vite build --mode=development
VOLUME /app

FROM nginx:1.25.4-alpine AS web
COPY ./nginx/http-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build ./app/build/assets /usr/share/nginx/html/service-module/services/assets
COPY --from=build ./app/build/index.html /usr/share/nginx/html/service-module
COPY --from=build ./app/build/favicon.ico /usr/share/nginx/html/service-module
RUN apk add --no-cache bash
COPY ./nginx/scripts/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh
EXPOSE 3006

ENTRYPOINT [ "bash", "/docker-entrypoint.d/env.sh" ]
