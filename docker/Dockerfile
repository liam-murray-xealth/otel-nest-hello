
FROM node:18-bullseye-slim

ARG GITHUB_SHA_SHORT
ENV GITHUB_SHA_SHORT=${GITHUB_SHA_SHORT}

WORKDIR /app

COPY package*.json ./
RUN npm install 
COPY . .
RUN npm run build && npm prune --production

RUN groupmod -g 1001 node && usermod -u 1001 -g 1001 node
USER 1001:1001

CMD [ "node", "dist/main.js" ]
