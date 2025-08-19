# 1단계: 빌드용 Node 이미지 (기존과 동일)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2단계: Nginx에 정적 파일 및 SSL 설정 복사
FROM nginx:alpine
# build 단계에서 생성된 정적 파일을 Nginx의 웹 루트 디렉토리로 복사
COPY --from=build /app/dist /usr/share/nginx/html
# 로컬에 생성된 nginx.conf 파일을 컨테이너 내부로 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80(HTTP) 및 443(HTTPS) 포트를 외부에 노출
EXPOSE 80
EXPOSE 443

# Nginx 실행 명령어
CMD ["nginx", "-g", "daemon off;"]
