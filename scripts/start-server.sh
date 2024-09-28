#!/bin/bash
set -e

echo "--------------- 서버 배포 시작 -----------------"
IMAGE_FILE_PATH="/home/ubuntu/sweatier-server/image.txt"
IMAGE_NAME=$(cat "$IMAGE_FILE_PATH")

docker stop sweatier-server || true
docker rm sweatier-server || true

docker pull $IMAGE_NAME
docker run -d --name sweatier-server -p 3000:3000 $IMAGE_NAME
