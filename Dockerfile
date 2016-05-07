FROM node
MAINTAINER Max Friederichs "max@maxfriederichs.com"

ENV PORT 3000

RUN mkdir /app
ADD . /app

WORKDIR /app/server/
RUN npm install

EXPOSE ${PORT}
CMD node /app/server/index.js

