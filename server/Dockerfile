FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm ci
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]