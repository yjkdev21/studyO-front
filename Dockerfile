# Stage 1: Build and Serve React app
FROM node:20

WORKDIR /app

# 패키지 설치
COPY package*.json ./
RUN npm install

# 소스 전체 복사 후 빌드
COPY . .
RUN npm run build

# serve 설치
RUN npm install -g serve

# 포트 설정
EXPOSE 3000

# 컨테이너 시작 명령
CMD ["serve", "-s", "build", "-l", "3000"]
