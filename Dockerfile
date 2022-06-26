FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 1337
ENV NODE_ENV=production
ENV TZ=Asia/Jakarta
CMD ["npm", "run", "docker:start"]