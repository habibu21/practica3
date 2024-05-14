FROM node:15

WORKDIR /app

COPY . .

RUN npm install &&
    npm install pm2 -g

CMD ["node", "start"]