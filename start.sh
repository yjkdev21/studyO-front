#!/bin/sh

# React/Vite 앱을 백그라운드에서 실행
npm run start &

# Nginx 실행
nginx -g "daemon off;"