# Gunakan Nginx Alpine yang ringan
FROM nginx:alpine

# Set working directory di Nginx
WORKDIR /usr/share/nginx/html

# Hapus file default Nginx
RUN rm -rf ./*

# Salin isi dari folder views/home ke direktori kerja Nginx
COPY ./views/home .

# Expose port internal Nginx
EXPOSE 80

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]