FROM node:18-alpine AS builder
WORKDIR /app
ENV CI=true
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
RUN npm ci --production
EXPOSE 3000
CMD ["npm","run","start"]
