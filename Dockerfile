FROM node:alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000

# CMD [ "node", "dist/src/main.js" ]
CMD [ "sh", "-c", "echo 'Container is running, use docker exec to inspect'; sleep infinity" ]
