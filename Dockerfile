FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY .env ./

RUN npm i -g pnpm
RUN pnpm i
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY ./dist/index.js ./index.js

EXPOSE 8080
CMD [ "node", "index.js" ]