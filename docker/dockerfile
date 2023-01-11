ARG NODE_VERSION=lts

FROM node:${NODE_VERSION}-alpine

ARG GITHUB_SHA_SHORT
ENV GITHUB_SHA_SHORT=${GITHUB_SHA_SHORT}

WORKDIR /app

COPY package*.json ./
RUN npm install 
COPY . .
RUN npm run build && npm prune --production

CMD [ "node", "dist/main.js" ]
