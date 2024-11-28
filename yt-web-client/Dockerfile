# STAGE 1: BUILD
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: PRODUCTION
FROM node:18
WORKDIR /app
COPY package*.json ./
# install only production dependencies
RUN npm install --only=production
# Copy built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# expose the listening port
EXPOSE 3000
# run app
CMD ["npm", "start"]
