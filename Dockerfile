# Stage 1: React build
FROM node:20 AS build
WORKDIR /app

# package.json과 package-lock.json 먼저 복사 (캐시 최적화)
COPY package*.json ./

# 의존성 설치
# npm ci는 package-lock.json에 따라 정확한 의존성을 설치합니다.
# npm install을 함께 사용할 필요는 없습니다.
RUN npm ci

# 소스 코드 복사
COPY . .

# React 앱 빌드 및 결과 확인
# 빌드 시 필요한 환경 변수가 있다면 `--build-arg`로 전달해야 합니다.
RUN npm run build && ls -la /app/dist/

# Stage 2: NGINX serve
FROM nginx:alpine
# 빌드된 React 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html
# NGINX 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 80(HTTP)과 443(HTTPS) 포트 노출
EXPOSE 80 443

# NGINX 실행 명령어
CMD ["nginx", "-g", "daemon off;"]
