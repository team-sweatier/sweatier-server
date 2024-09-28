#!/bin/bash

echo "--------------- 서버 배포 시작 -----------------"
docker stop sweatier-server || true
docker rm sweatier-server || true
docker pull ${ECR_REGISTRY}/sweatier-server:latest
docker run -d --name sweatier-server -p 3000:3000 ${ECR_REGISTRY}/sweatier-server:latest
