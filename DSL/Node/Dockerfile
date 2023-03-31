# Build Image #######################
FROM node:18.14.2-alpine
WORKDIR /app
COPY tsconfig.json ./
COPY package.json ./
RUN npm install
COPY src ./
RUN npm run build

# Run Image #########################
FROM node:18.14.2-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY --from=0 /app/dist .
RUN npm install pm2 -g 
EXPOSE 3008
#CMD ["npm","run","start"]
CMD ["pm2-runtime","index.js"]
