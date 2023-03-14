
FROM node:18-bullseye-slim

ARG GITHUB_SHA_SHORT
ENV GITHUB_SHA_SHORT=${GITHUB_SHA_SHORT}

RUN groupmod -g 1001 node && usermod -u 1001 -g 1001 node
USER 1001:1001

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install 
COPY --chown=node:node . .
RUN npm run build && npm prune --production


CMD [ "node", "dist/main.js" ]
