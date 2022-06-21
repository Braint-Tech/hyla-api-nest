ARG NODE_VERSION=node:16.15.1
ARG ALPINE_VERSION=alpine3.15

# Base image
FROM ${NODE_VERSION}-${ALPINE_VERSION} as base

WORKDIR /home/node/app

RUN chown node:node .

# Builder image, used only for build 
FROM base as builder

COPY . .

RUN chown -Rh root:root /home/node/app
RUN npm install && \
    npm run build

# Production image, with dist artifacts and production mode enabled
FROM base as production

USER node

ENV NODE_ENV production

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /home/node/app/dist ./dist

RUN npm install --only=production

EXPOSE 3000

CMD npm run start