###################
# 로컬 개발용 빌드
###################

FROM node:20.11-alpine3.18 As development

# 앱 디렉토리 생성
WORKDIR /usr/src/app

# 애플리케이션 패키지 명세를 컨테이너 이미지에 복사
# 와일드카드를 사용하여 package.json 및 package-lock.json(사용 가능한 경우)을 모두 복사
# 이 작업을 먼저 수행하면 코드 변경 시마다 npm install을 다시 실행하지 않아도 됨
COPY --chown=node:node package*.json ./

# `npm ci` 명령어를 사용하여 앱 의존성 설치
RUN npm ci

# 앱 소스 번들링
COPY --chown=node:node . .

# 이미지의 node 사용자 사용(루트 사용자 대신)
USER node

###################
# 프로덕션용 빌드
###################

FROM node:20.11-alpine3.18 As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

# `npm run build`를 실행하기 위해 Nest CLI에 접근
#   이전 개발 단계에서 `npm ci`를 실행하여 모든 의존성을 설치했으므로
#   개발 이미지에서 node_modules 디렉토리를 복사할 수 있음
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# 프로덕션 번들을 생성하는 빌드 명령어 실행
RUN npm run build

# NODE_ENV 환경 변수 설정
ENV NODE_ENV production

# `npm ci` 실행은 기존 node_modules 디렉토리를 제거하고 
#   --only=production을 전달하여 프로덕션 의존성만 설치
#   -> node_modules 디렉토리가 최적화됨
RUN npm ci --only=production && npm cache clean --force

USER node

###################
# 프로덕션
###################

FROM node:20.11-alpine3.18 As production

# 빌드 단계에서 번들된 코드를 프로덕션 이미지로 복사
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# 프로덕션 빌드를 사용하여 서버 시작
CMD [ "node", "dist/main.js" ]