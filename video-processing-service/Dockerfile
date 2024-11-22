# STAGE 1: BUILD - compile to JS
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: PRODUCTION - serve compiled JS
FROM node:18
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY package*.json ./
# do not install production dependencies!
RUN npm install --only=production
# serve only compiled files from dist
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "serve"]