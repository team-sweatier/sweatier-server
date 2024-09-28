#!/bin/bash

echo "--------------- 서버 배포 시작 -----------------"
# .env 파일이 존재하는지 확인하고 환경 변수를 불러옵니다
if [ -f "/home/ubuntu/sweatier-server/.env" ]; then
  export $(xargs < /home/ubuntu/sweatier-server/.env)
fi
docker stop sweatier-server || true
docker rm sweatier-server || true
docker pull ${ECR_REGISTRY}/sweatier-server:latest
docker run -d --name sweatier-server -p 3000:3000 ${ECR_REGISTRY}/sweatier-server:latest
