FROM  nginx:alpine3.18
WORKDIR /app
COPY  default.conf   /etc/nginx/conf.d/default.conf
COPY  dist/  /usr/share/nginx/html/
