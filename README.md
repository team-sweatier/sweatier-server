# [Sweatier](https://sweatier-client.vercel.app/)

![](https://i.imgur.com/IT6AYVD.png)

## 💧 목차
[1. 프로젝트 및 서비스 소개](#1-프로젝트-및-서비스-소개)

[2. 팀원 소개](#2-팀원-소개)

[3. 기술 스택](#3-기술-스택)

[4. 깃허브 전략](#4-깃허브-전략)

[5. 주요 기능](#5-주요-기능)

[6. ERD](#6-erd)

[7. API 문서](#7-api-문서)

## 1. 프로젝트 및 서비스 소개
**Sweatier**는 수준별 운동 매칭을 통해 실력이 비슷한 사람들과 운동을 즐기고 사용자의 운동 수준(티어)을 평가받을 수 있는 서비스입니다.

땀을 의미하는 **Sweat 💧**와 등급을 의미하는 **Tier 🎖️**를 결합해, 유저들과 함께 땀을 흘리며 당신의 운동 티어를 올려보세요!

• **개발기간** : 2024.02.29 - 2024.03.15

• **팀 구성** : BE 3명, FE 3명, 디자이너 1명

• [배포 주소](https://sweatier-client.vercel.app/)

• [발표 PPT](https://www.canva.com/design/DAF_eGLYB6Y/ov4cFLs5zKZktzLgKcqvKg/edit?utm_content=DAF_eGLYB6Y&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

## 2. 팀원 소개

| 프로필 | 깃허브 | 담당 기능 |
| :-: | :-: | :-: |
| <img src="https://i.imgur.com/1442bdd.png" width="150" height="150"><br/>고지명 | [jimyungkoh](https://github.com/jimyungkoh) | Batch, 검색 관련  api 구현 <br/> 클라우드 환경 배포, 운영 <br/> 카카오 로그인 (FE, BE)|
| <img src="https://i.imgur.com/cnHn465.png" width="150" height="150"><br/>강준호 | [mpfo0106](https://github.com/mpfo0106) | user 관련 api 구현<br/>더미 시드 데이터 생성 구현|
| <img src="https://i.imgur.com/knasvXq.png" width="150" height="150"><br/>박상희 | [Sangddong](https://github.com/Sangddong) | match 관련 로직 구현<br/>유효성 검사 및 에러처리<br/>API 문서 작성 |

## 3. 기술 스택
![기술 스택](https://i.imgur.com/IGPeWFS.png)

## 4. 깃허브 전략

### Branch 관리 규칙

- **develop** : 개발 서버에 배포하는 데 사용되는 주요 개발 브랜치
- **feat** : GitHub 이슈에 대응하여 개발 서버에 배포하기 위한 기능을 개발하는 브랜치
- **hotfix** :개발 서버에 배포된 버전에 문제가 발생했을 때 해결하기 위해 사용되는 브랜치

### Commit Convention

- commitlint & Husky 활용

|   유형   |                 설명                 |
| :------: | :----------------------------------: |
|   feat   |       새로운 기능에 대한 커밋        |
|   fix    |        버그 수정에 대한 커밋         |
|  chore   |    그 외 자잘한 수정에 대한 커밋     |
|   docs   |        문서 수정에 대한 커밋         |
|  style   | 코드 스타일 혹은 포맷 등에 관한 커밋 |
| refactor |      코드 리팩토링에 대한 커밋       |
|   test   |     테스트 코드 수정에 대한 커밋     |

<br />

## 5. 주요 기능

사용자
- 회원가입 및 로그인
- 유저 정보 등록 및 프로필 변경
- 신청내역 및 경기내역 조회
- 티어 정보 조회
- 관심 종목 설정

경기
- 경기 리스트 조회
- 경기 상세 정보 조회 및 참여 가능 여부 확인
- 경기 참여 신청
- 경기 모집글 수정 및 관리
- 경기 결과 등록 및 평가

## 6. ERD

![](https://i.imgur.com/thlacFi.png)

## 7. API 문서
[Sweatier-API-문서](https://documenter.getpostman.com/view/32959422/2sA2xpRUCX)

## 8. 팀원별 트러블 슈팅(추가예정)