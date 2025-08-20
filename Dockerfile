# Stage 1: React build
FROM node:20 AS build
WORKDIR /app

# package.json과 package-lock.json 먼저 복사 (캐시 최적화)
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# React 앱 빌드 및 결과 확인
RUN npm run build && ls -la /app/dist/

# Stage 2: NGINX serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]