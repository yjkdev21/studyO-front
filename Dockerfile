# 1단계: React 빌드
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2단계: Nginx 컨테이너
FROM nginx:alpine

# 빌드된 React 정적 파일을 Nginx 웹 루트로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 설정 복사 (SSL + proxy_pass 포함)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80
EXPOSE 443

# 실행
CMD ["nginx", "-g", "daemon off;"]
