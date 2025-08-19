FROM node:20-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 프론트엔드 빌드
RUN npm run build

# Nginx를 사용한 최종 이미지
FROM nginx:stable-alpine

# 빌드된 파일들을 Nginx 디렉토리로 복사
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# 컨테이너 시작 시 실행될 명령어
CMD ["nginx", "-g", "daemon off;"]