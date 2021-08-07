FROM node:10-alpine
ARG NPM_TOKEN
WORKDIR /usr/src/app
COPY package*.json ./
RUN echo -e "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}\nregistry=https://npm.pkg.github.com/TeamYourCircle" > .npmrc
RUN npm install
COPY . .
EXPOSE 5002
CMD ["npm", "start"]