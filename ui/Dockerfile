FROM node:lts-alpine AS build

WORKDIR /app

COPY . .

RUN npm install -f
RUN npm run build


FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/ui/browser /usr/share/nginx/html

EXPOSE 80
