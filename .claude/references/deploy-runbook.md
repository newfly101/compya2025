# 배포·운영 가이드

> 기준일: 2026-09-28 · 읽는 대상: 이 저장소를 배포하거나 장애를 대응하는 사람 (현재는 운영자 1인)

이 문서는 컴프야펀(compyafun.com) 이 코드에서 실제 서비스까지 어떻게 나가는지, 무엇을 설정해야 파이프라인이 도는지, 문제가 생겼을 때 어디를 보는지를 정리한다. 내용은 `.github/workflows/deploy-be.yml`, `.github/workflows/deploy-fe.yml` 을 실제로 읽고 작성했다 — 파일에 없는 단계는 적지 않았다.

---

## 1. 배포 구조 한눈에

| 영역 | 흐름 |
|---|---|
| **FE** | `web/**` 변경 push → GitHub Actions 자동 실행 → 빌드+prerender → S3(`compya-images`) 동기화 → CloudFront 무효화 |
| **BE** | 사람이 Actions 탭에서 수동 실행(workflow_dispatch) → Gradle 빌드 → S3(비공개 아티팩트 버킷)에 jar 업로드 → AWS SSM 으로 EC2 에 원격 배포 명령 전달 |

⚠️ **BE 자동 배포는 현재 꺼져 있다.** `deploy-be.yml` 의 `push` 트리거는 주석 처리돼 있고 `workflow_dispatch` 만 열려 있다 — 사전 준비(§ 3, `docs/global-guide/develop/be-deploy-setup.md`)가 끝나지 않아서다. 지금은 BE 배포를 하려면 Actions 탭에서 수동으로 눌러야 한다.

FE(`compyafun.com`)와 BE API(`api.compyafun.com`)는 서브도메인이 나뉘어 있다 — `application-prod.properties` 의 네이버 redirect-uri, `web/src/config/env.js` 의 `API_BASE_URL` 로 확인된다.

FE 와 BE 는 같은 AWS 계정을 쓰지만 버킷은 분리돼 있다. `compya-images` 는 FE 정적 파일 **+ 사용자 업로드 이미지**가 같이 있는 버킷이라 FE 배포의 `--delete` 동기화가 업로드물을 건드리지 않도록 `uploads/*`, `portfolio/*` 를 제외한다.

두 워크플로 모두 원래는 로컬에서 손으로 돌리던 `scripts/deploy-be.sh` / `scripts/deploy-fe.sh` 였다. 2026-09-13 에 GitHub Actions 로 이관하고 로컬 스크립트는 삭제했다 (`docs/global-guide/develop/scripts-cleanup-plan.md`).

---

## 2. 자동 배포 (GitHub Actions)

| 워크플로 | 언제 돈다 (트리거) | 하는 일 | 배포 대상 |
|---|---|---|---|
| `deploy-fe.yml` | `master` 에 `web/**` 변경 push, 또는 수동 실행 | 빌드 → prerender 검증 → S3 동기화 → CloudFront 무효화 → 라이브 검증 | S3 `compya-images` + CloudFront |
| `deploy-be.yml` | **수동 실행만** (`workflow_dispatch`) — push 트리거는 비활성 | Gradle 빌드 → jar 크기 검증 → S3 업로드 → SSM 으로 EC2 원격 배포 | EC2 인스턴스 (systemd `compyafun-web`) |

두 워크플로 모두 `concurrency` 그룹으로 동시 실행을 막는다(`cancel-in-progress: false`) — 이미 도는 배포가 끝날 때까지 다음 배포는 대기한다.

### deploy-fe.yml 단계

1. Node 20 설치 후 `web/` 에서 `npm ci`
2. `npm run build:prerender` — Vite 빌드 + 라우트별 prerender 스냅샷 + 사이트맵 생성
3. `web/scripts/verify-prerender.mjs` 로 스냅샷 검증 — 여기서 실패하면 **S3 동기화 전에 멈춘다**. prerender 가 중간에 깨져도 `vite build` 가 만든 빈 SPA 셸(index.html)이 남기 때문에, 이 검증이 없으면 빈 페이지가 그대로 배포될 수 있어서 넣은 가드다 (AdSense 반려 재발 방지)
4. `aws s3 sync web/dist s3://compya-images --delete --exclude "uploads/*" --exclude "portfolio/*"`
5. CloudFront(`E3TX8OFJBC8IML`) 무효화 생성 후 **전파 완료까지 대기** (`aws cloudfront wait invalidation-completed`, 최대 10분)
6. 배포 후 라이브 검증 — `https://compyafun.com/ads.txt` 의 content-type 이 `text/plain` 인지, 홈 HTML 에 prerender 실텍스트("최신 쿠폰")가 있는지 확인. 둘 중 하나라도 실패하면 **워크플로를 실패 처리**한다 (배포 자체는 이미 나간 뒤이므로 후속 확인이 필요하다는 신호)

### deploy-be.yml 단계

1. `build.gradle` 에서 Java 버전을 읽어 JDK 설치, `./gradlew clean bootJar` 로 빌드
2. 산출물 `build/libs/compyafun-web.jar` 존재 여부 + 최소 크기(5MB) 검증
3. 배포 시크릿(`BE_ARTIFACT_BUCKET`, `BE_INSTANCE_ID`) 존재 여부 검증 — 없으면 여기서 멈춘다
4. jar 를 `s3://<BE_ARTIFACT_BUCKET>/be/<commit-sha>/compyafun-web.jar` 로 업로드
5. AWS SSM `send-command` 로 EC2 에 원격 스크립트 전달 — 스크립트가 하는 일: S3 에서 jar 재다운로드 → 크기 재검증 → 기존 jar 를 `bak/compyafun-web-<시각>.jar` 로 백업 → 교체 → `systemctl restart compyafun-web` + `nginx` → 10초 대기 후 기동 상태 확인
6. SSM 명령 완료를 기다려 상태(`Success`/그 외)와 원격 stdout/stderr 를 워크플로 로그에 그대로 출력

---

## 3. 필요한 설정값

값은 적지 않는다 — 이름과 용도, 어디에 설정하는지만.

| 이름 | 무엇인가 | 어디에 설정하나 |
|---|---|---|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | FE·BE 배포가 공용으로 쓰는 IAM 사용자 키 (BE 는 추가 권한 필요, 표 아래 참고) | GitHub Secrets (저장소 Settings → Secrets and variables → Actions) |
| `BE_ARTIFACT_BUCKET` | BE jar 를 올리는 **비공개** S3 버킷명 | GitHub Secrets |
| `BE_INSTANCE_ID` | BE 를 배포할 EC2 인스턴스 ID | GitHub Secrets |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` | 로컬 개발용 DB 접속 정보 | 서버 환경변수 또는 `.env.properties` (로컬 전용, git 미추적) |
| `PROD_DB_HOST` / `PROD_DB_PORT` / `PROD_DB_NAME` / `PROD_DB_USERNAME` / `PROD_DB_PASSWORD` | 운영 DB 접속 정보 | 운영 서버 환경변수 (EC2 상의 `.env` — git 미추적) |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` / `NAVER_REDIRECT_URI` | 로컬용 네이버 OAuth 앱 키 | 서버 환경변수 / `.env.properties` |
| `PROD_NAVER_CLIENT_ID` / `PROD_NAVER_CLIENT_SECRET` | 운영용 네이버 OAuth 앱 키 (redirect-uri 는 properties 에 고정값) | 운영 서버 환경변수 |
| `JWT_SECRET` / `PROD_JWT_SECRET` | JWT 서명 키 (32자 이상) | 로컬: 서버 환경변수 / 운영: EC2 환경변수 |
| `AWS_CREDENTIALS_ACCESS_KEY` / `AWS_CREDENTIALS_SECRET_KEY` / `PROD_AWS_ACCESS_KEY` / `PROD_AWS_SECRET_KEY` | BE 애플리케이션이 S3 업로드(이미지)에 쓰는 자격증명 — 위 GitHub Actions 배포용 키와는 **별개** | 로컬: 서버 환경변수 / 운영: EC2 환경변수 |
| `AWS_REGION_STATIC_VALUE` / `AWS_S3_BUCKET` / `AWS_S3_URL` | 로컬용 S3 리전·버킷·URL (운영은 `application-prod.properties` 에 고정값) | 서버 환경변수 |
| `SWAGGER_UI_ENABLED` | 로컬 Swagger UI 노출 여부 (운영은 properties 에서 항상 `false`) | 서버 환경변수 (기본값 `false`) |

BE 배포용 IAM 사용자는 FE 배포 권한 외에 `s3:PutObject`(아티팩트 버킷), `ssm:SendCommand`, `ssm:GetCommandInvocation` 이 추가로 필요하다. EC2 인스턴스 역할에는 `AmazonSSMManagedInstanceCore` + 아티팩트 버킷 `s3:GetObject` 가 필요하다. 상세 체크리스트는 `docs/global-guide/develop/be-deploy-setup.md` 참고.

---

## 4. 환경 분리

| | 로컬 (`application.properties`) | 운영 (`application-prod.properties`) |
|---|---|---|
| DB 접속 | `DB_*` 환경변수, 기본값 없음 | `PROD_DB_*`, host/port/name 은 기본값(`127.0.0.1`/`3306`/`compyafun`) 있음 |
| 시크릿 파일 | `spring.config.import=optional:file:.env.properties` — `.env`/`.env.local` 을 복사해서 사용 | `spring.config.import=optional:file:.env` — EC2 상의 `.env` 직접 사용 |
| 네이버 redirect-uri | 환경변수로 주입 | `https://api.compyafun.com/api/auth/naver/callback` 고정 |
| JWT 액세스 토큰 만료 | 30분 | 60분 |
| S3 리전/버킷 | 환경변수 | `ap-northeast-2` / `compya-images` 고정 |
| Swagger UI | 환경변수로 켤 수 있음(기본 꺼짐) | 항상 꺼짐 |

**프로필 활성화**: Spring Boot 표준 방식은 `--spring.profiles.active=prod` 또는 환경변수 `SPRING_PROFILES_ACTIVE=prod` 다. 다만 EC2 상의 실제 systemd 유닛 파일(`compyafun-web` 서비스)은 이 저장소에 없어 **어떤 방식으로 prod 프로필을 켜는지는 이 저장소 안에서 확인할 수 없다** — § 8 "아직 없는 것" 참고.

---

## 5. 릴리스 절차

번호 순서대로 진행한다. 상세 배경은 `docs/convention/versioning.md` § 8.

1. **master 직접 push 금지.** 항상 `feat/{도메인}-{요약}` / `fix/{도메인}-{요약}` 브랜치를 만들어 작업한다.
2. 브랜치에서 PR 생성 → 리뷰(또는 셀프 확인) 후 **master 로 머지**.
3. 직전 태그 이후 커밋을 확인해 버전 bump 등급을 정한다.
   ```bash
   git log --oneline v2.0.0..master
   ```
4. `docs/CHANGELOG.md` 의 `[Unreleased]` 항목을 새 섹션 `## [vX.Y.Z] (platform-A.B) — YYYY-MM-DD` 로 옮긴다. 커밋 제목 복붙이 아니라 이용자 관점 문장으로 쓴다.
5. (버전 필드 동기화가 적용된 이후부터) `web/package.json`, `build.gradle` 의 `version` 을 새 기능 버전과 맞춘다. 단 `build.gradle` 의 `bootJar.archiveFileName` 은 `${rootProject.name}.jar` 로 고정돼 있어 `version` 값이 바뀌어도 산출물 파일명(`compyafun-web.jar`)은 그대로다 — `deploy-be.yml` 이 참조하는 `JAR_NAME` 에 영향 없음.
6. master 머지가 확인되면 **annotated 태그**를 찍는다.
   ```bash
   git tag -a v2.1.0 -m "v2.1.0 (platform-2.0)" -m "platform: platform-2.0" -m "요약: ..."
   git push origin v2.1.0
   ```
7. 배포한다.
   - FE: master 에 `web/**` 변경이 있으면 push 시점에 자동 배포됨 — Actions 탭에서 실행 결과 확인
   - BE: 변경이 있을 때만 Actions 탭에서 `Deploy BE` 를 **workflow_dispatch** 로 수동 실행
   - DB: 스키마 변경이 있으면 `sql/V3/` DDL 을 배포 **전에** 운영에 직접 적용 (§ 7 의 DB 공유 경고 참고)
8. 배포 후 운영 화면을 직접 확인하고, 이상 있으면 CHANGELOG 에 PATCH 릴리스로 기록한다.

---

## 6. 문제가 생겼을 때

| 증상 | 확인할 곳 | 대응 |
|---|---|---|
| FE 워크플로가 `prerender 스냅샷 검증` 단계에서 실패 | Actions 로그의 `verify-prerender.mjs` 출력 | S3 동기화 전이라 운영에는 영향 없음. 로컬에서 `npm run build:prerender` 재현 후 원인 수정 |
| FE 워크플로는 성공했는데 "배포 후 라이브 검증"이 실패 | 로그가 안내하는 `https://compyafun.com/ads.txt`, `https://compyafun.com/` 을 직접 열어 확인 | 배포는 이미 나간 뒤 — CloudFront 캐시 문제는 아님(무효화 전파 대기 후 검증함). 원인 파악 후 재배포 |
| BE 워크플로가 `Verify build artifact` 에서 실패 | 로그의 jar 크기 | 빌드 산출물이 비정상 — 로컬에서 `./gradlew clean bootJar` 재현 |
| BE 워크플로가 `Validate deployment secrets` 에서 실패 | `BE_ARTIFACT_BUCKET`/`BE_INSTANCE_ID` 시크릿 등록 여부 | § 3 표대로 GitHub Secrets 등록 |
| BE 원격 배포가 "다운로드 실패/크기 작음"으로 중단 | SSM 명령 stdout (워크플로 로그에 그대로 출력됨) | 기존 jar 는 그대로 유지된 상태 — S3 업로드본 재확인 후 재실행 |
| BE 배포 후 서비스 기동 실패 | 워크플로 로그에 찍힌 `journalctl -u compyafun-web -n 40` 출력 | 아래 "BE 롤백" 참고 |
| SSM 명령 자체가 `Success` 가 아닌 상태로 끝남 | 워크플로 로그의 `원격 명령 상태` / stdout·stderr | 아래 "BE 롤백" 참고 |
| FE 를 이전 상태로 되돌리고 싶다 | 없음(자동 롤백 미구현, § 8) | 문제 커밋을 revert 하고 다시 master 에 push해 재배포하는 방식만 가능 |

**BE 롤백** — 배포 스크립트가 교체 전 jar 를 `/opt/compyafun/bak/compyafun-web-<시각>.jar` 로 백업해 둔다. 실패 시 로그가 안내하는 시각(STAMP)을 넣어 되돌린다.

EC2 에 직접 접속했다면:
```bash
sudo cp /opt/compyafun/bak/compyafun-web-<시각>.jar /opt/compyafun/compyafun-web.jar
sudo systemctl restart compyafun-web
```

로컬/CI 에서 SSM 으로 재전송한다면:
```bash
aws ssm send-command --instance-ids "<INSTANCE_ID>" --document-name AWS-RunShellScript \
  --parameters commands="sudo cp /opt/compyafun/bak/compyafun-web-<시각>.jar /opt/compyafun/compyafun-web.jar && sudo systemctl restart compyafun-web && sudo systemctl restart nginx"
```

---

## 7. 운영 시 주의

⚠️ **테스트 DB 와 운영 DB 가 같은 인스턴스다.** `sql/V3/` 에 DDL 을 작성하는 순간 운영에도 즉시 반영된다. 스키마 변경 작업 전에는 반드시 사용자 확인을 받는다 — 로컬/스테이징에서 먼저 검증할 방법이 없다.

- 운영자는 1인 체제다. 배포 실행·장애 대응·콘텐츠 등록이 전부 한 사람에게 몰린다.
- 이벤트·공지·쿠폰 같은 콘텐츠는 어드민 화면에서 수동으로 등록한다 — 자동 발행 파이프라인은 없다.
- BE 배포는 사람이 Actions 탭을 직접 눌러야 나간다(§ 2). 코드가 master 에 머지됐다고 자동으로 서버에 반영되지 않는다.
- CloudFront 에는 뷰어 요청 함수 1개가 붙어 있다 — 원본은 `infra/cloudfront/rewrite-index.js`. 디렉터리 경로를 `index.html` 로 리라이트해 prerender 스냅샷이 서빙되게 하고, `www` → apex 301 을 처리한다. **Actions 가 배포하지 않는다** — 고치면 CloudFront 콘솔(배포 `E3TX8OFJBC8IML` → 함수 → 뷰어 요청)에 직접 붙여 넣고 게시한다. 런타임이 ES5.1 이라 최신 문법 금지(파일 머리 주석).

---

## 8. 아직 없는 것

확인 결과 이 저장소·워크플로 안에는 없는 것들이다. 필요해지면 별도로 구축해야 한다.

- 모니터링·알림 (에러율/응답시간 대시보드, 장애 알림 채널) — 없음
- 스테이징(운영과 분리된 검증) 환경 — 없음. 테스트 DB = 운영 DB 라 로컬 실행이 사실상 유일한 사전 검증
- BE/FE 자동 롤백 — 없음. BE 는 EC2 상의 백업 jar 로 수동 복구만 가능, FE 는 revert 후 재배포만 가능
- BE 자동 배포(push 트리거) — 준비 중, 현재 비활성 (§ 2)
- prod 프로필 활성화 방식(systemd 유닛 파일 등) — 이 저장소에는 없어 확인 불가
- 배포 성공/실패에 대한 Slack 등 외부 알림 연동 — 없음 (GitHub Actions 로그 확인이 전부)
- 배포 파이프라인 안에서의 자동 테스트 실행 — 두 워크플로 모두 빌드·검증 단계만 있고 `./gradlew test` / FE 테스트 실행 단계는 없음

---

## 9. 관련 문서

- [./setup.md](./setup.md)
- [./api.md](./api.md)
- [./database.md](./database.md)
- [../convention/versioning.md](../convention/versioning.md)
- [../CHANGELOG.md](../CHANGELOG.md)
- [../_roadmap/roadmap.md](../_roadmap/roadmap.md)
