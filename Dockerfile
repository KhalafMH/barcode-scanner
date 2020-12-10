FROM node:14 as builder
COPY . /source
WORKDIR /source
RUN npm ci --production
RUN npm run build

FROM bitnami/nginx:1.19
COPY --from=builder /source/build /app
