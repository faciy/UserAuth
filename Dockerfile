FROM node:16.14-alpine3.14 AS builder

# Create app directory
WORKDIR /charles/src/app

# install dependencies
COPY . /charles/src/app

RUN npm install && npm cache clean --force

RUN npm run build

FROM node:16.14-alpine3.14

WORKDIR /app

COPY --from=builder /charles/src/app/node_modules /app/node_modules
COPY --from=builder /charles/src/app/package*.json ./
COPY --from=builder /charles/src/app/tsconfig.*.json ./
COPY --from=builder /charles/src/app/dist /app/dist

# Bundle app source
COPY . .

EXPOSE 8000
CMD ["npm", "run", "start"]