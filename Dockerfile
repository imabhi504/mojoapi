FROM node:lts-alpine

RUN addgroup -S app && adduser -S -g app app

ENV HOME=/home/app

COPY package.json  $HOME/app/

COPY . $HOME/app/

WORKDIR $HOME/app

RUN chown -R app:app $HOME/* && \
    npm install --silent --progress=false --production && \
    npm audit fix && \
    chown -R app:app $HOME/*

USER app

EXPOSE 3000

CMD ["node", "server.js"]

