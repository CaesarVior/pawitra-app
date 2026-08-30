FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY . .

COPY default.conf /etc/nginx/conf.d/default.conf

RUN rm -rf Dockerfile docker-compose.yml Jenkinsfile README.md default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]