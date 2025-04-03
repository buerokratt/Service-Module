FROM node:22-alpine

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot
USER nonroot

WORKDIR /usr/src/app

COPY pipelines.js ./
COPY package.json ./
COPY pipelines/ ./pipelines/

RUN npm install --ignore-scripts
ENTRYPOINT ["npm","start"]
