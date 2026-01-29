FROM node:24-bullseye AS builder

WORKDIR /app

COPY package*.json yarn.lock* ./
COPY prisma ./prisma/

RUN yarn install

COPY . .

RUN yarn run build && ls -la dist/

FROM node:24-bullseye AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

ENV PORT=3000
EXPOSE 3000

CMD ["yarn", "start"]
