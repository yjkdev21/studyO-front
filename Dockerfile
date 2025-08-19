# 1단계: 빌드용 Node 이미지 (기존과 동일)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2단계: Nginx에 정적 파일 및 SSL 설정 복사
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# start.sh 스크립트 추가
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80
EXPOSE 443

# Nginx와 React/Vite 앱을 모두 실행하도록 CMD 명령어 변경
CMD ["/start.sh"]
