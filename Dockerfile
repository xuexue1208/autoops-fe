FROM  nginx:alpine3.18
WORKDIR /app

COPY  dist/  /usr/share/nginx/html/
