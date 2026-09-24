# Stage 1: Build the React/Vite application
FROM node:22-alpine AS builder
WORKDIR /app

# คัดลอก package.json เพื่อติดตั้ง dependencies ก่อน (ช่วยเรื่อง Caching)
COPY package.json package-lock.json ./
RUN npm ci

# คัดลอกโค้ดทั้งหมดแล้วสั่ง Build
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# คัดลอกไฟล์ตั้งค่า Nginx ที่เราสร้างไว้
COPY nginx.conf /etc/nginx/conf.d/default.conf

# คัดลอกไฟล์สเตติกที่ Build เสร็จแล้ว (จาก Stage 1) ไปไว้ใน Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
