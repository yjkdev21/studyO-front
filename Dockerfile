# Stage 1: Build React app
FROM node:20 AS build

WORKDIR /app
COPY frontend/ .   # React 프로젝트 폴더 위치
RUN npm install
RUN npm run build   # build 폴더 생성

# Stage 2: Serve with NGINX
FROM nginx:alpine

# React 정적 파일 복사
COPY --from=build /app/build /usr/share/nginx/html

# NGINX 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 불필요한 start.sh 제거
# EXPOSE 80 이미 NGINX 이미지에서 열림
CMD ["nginx", "-g", "daemon off;"]
