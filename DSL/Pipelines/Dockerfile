FROM node:22-alpine

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot
USER nonroot

WORKDIR /usr/src/app

COPY --chown=nonroot:nonroot pipelines.js ./
COPY --chown=nonroot:nonroot package.json ./
COPY --chown=nonroot:nonroot pipelines/ ./pipelines/

RUN npm install --ignore-scripts
ENTRYPOINT ["npm","start"]
