# 로컬 개발환경 구축 가이드

## 1. 이 문서가 무엇인가

새로 합류한 개발자가 저장소를 clone 한 뒤 화면이 뜰 때까지 따라 하는 절차서다. BE(Spring Boot) + FE(React/Vite) 를 로컬에서 띄우는 것만 다룬다.

Claude agent 자동화 · Figma 연동 환경 셋업은 **별개 문서**다 — [`../../SETTING.md`](../../SETTING.md) 참고. 이 문서와 헷갈리지 말 것.

---

## 2. 준비물

| 항목 | 버전 | 받는 곳 |
|---|---|---|
| Java (JDK) | 21 (`build.gradle` toolchain) | https://adoptium.net (Temurin 21) |
| Gradle | 8.14.3 — **wrapper 포함, 별도 설치 불필요** (`./gradlew` 가 자동으로 받음) | - |
| Node.js | 20 (`.github/workflows/deploy-fe.yml` CI 기준) | https://nodejs.org |
| MariaDB | 10.5.29 (운영 실측 버전, `docs/global-guide/develop/specs/db/prod-actual-state.md`) | https://mariadb.org/download |
| Git | 확인 필요 (버전 고정 없음) | https://git-scm.com |

로컬에 MariaDB 인스턴스가 따로 없다면 팀에 개발용 DB 접속 정보를 요청한다. ⚠️ 이 프로젝트는 **테스트 DB와 운영 DB가 같은 인스턴스**다 — § 5 참고.

BE 빌드는 Gradle wrapper(`gradlew`/`gradlew.bat`)가 지정 버전(8.14.3)을 알아서 받아오므로 Gradle을 따로 설치할 필요는 없다. Java 21 toolchain 도 Gradle 이 없으면 자동으로 받아오지 않으므로, JDK 21은 직접 설치해야 한다.

---

## 3. 받아서 띄우기

Windows PowerShell 기준, 필요한 곳에 bash 병기.

### 3.1 clone

```powershell
git clone <repo-url>
cd com2usbaseball
```

### 3.2 BE 설정 파일 준비

`spring.config.import=optional:file:.env.properties` 로 로컬 설정을 불러온다 (`src/main/resources/application.properties` 27~29행 주석 참고). `.env` 파일은 Spring 이 확장자를 못 읽어서 직접 파싱이 안 된다 — 반드시 `.env.properties` 이름으로 저장소 루트에 둔다. 저장소는 이 파일을 git 추적하지 않는다.

```powershell
New-Item -ItemType File .env.properties
notepad .env.properties
```
```bash
touch .env.properties
```

§ 4 표의 키를 `KEY=값` 형식으로 채운다. (운영 배포는 `application-prod.properties` 가 `.env` 를 직접 읽는 별도 경로 — 로컬 개발과 무관, 헷갈리지 말 것.)

### 3.3 DB 스키마 적재

§ 5 순서대로 실행 (MariaDB 클라이언트 기준):

```powershell
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USERNAME> -p <DB_NAME> < sql/V2/CREATE_03_TABLE_FUN.sql
```

나머지 파일도 같은 방식으로 순서대로 실행한다.

### 3.4 BE 서버 실행

```powershell
.\gradlew.bat bootRun
```
```bash
./gradlew bootRun
```

기본 포트 `8080` (별도 `server.port` 설정 없음 — Spring 기본값, `SwaggerConfig.java` 34행도 `localhost:8080` 기준).

### 3.5 FE 설치 및 실행

```powershell
cd web
npm install
npm start
```

Vite dev 서버가 `http://localhost:3000` 에서 뜨고 브라우저가 자동으로 열린다 (`web/vite.config.js` — `server.open: true`, `port: 3000`).

### 3.6 접속 확인

- FE: `http://localhost:3000`
- BE health: `http://localhost:8080` (엔드포인트 직접 호출로 확인)
- Swagger UI (선택, `SWAGGER_UI_ENABLED=true` 설정 시): `http://localhost:8080/swagger-ui.html`

---

## 4. 설정값 채우기

`.env.properties` 에 채울 키. **값은 여기 적지 않는다** — 각자 발급받은 값을 채운다.

| 키 | 무엇인가 | 어디서 받나 | 없으면 어떻게 되나 |
|---|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` | MariaDB 접속 주소 | 팀 공유 DB 접속 정보 | BE 기동 실패 (datasource 연결 불가) |
| `DB_USERNAME` / `DB_PASSWORD` | DB 계정 | 팀 공유 DB 접속 정보 | 위와 동일 |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | 네이버 로그인 OAuth 앱 키 | [네이버 개발자센터](https://developers.naver.com/apps) 애플리케이션 등록 후 발급 | `NaverOauthProperties` 가 기동 시점에 `IllegalStateException` 던짐 (blank 검증) |
| `NAVER_REDIRECT_URI` | OAuth 콜백 URL | 네이버 개발자센터에 등록한 콜백과 동일하게. 로컬은 `http://localhost:8080/api/auth/naver/callback` | 콜백 시 네이버 측에서 리다이렉트 URI 불일치 에러 |
| `JWT_SECRET` | JWT 서명 키 (32자 이상, 주석 `# JWT 32 over`) | 로컬에서 임의 문자열 생성 (운영 값과 달라야 함) | 토큰 발급/검증 실패 |
| `AWS_CREDENTIALS_ACCESS_KEY` / `AWS_CREDENTIALS_SECRET_KEY` | S3 업로드용 AWS 키 | AWS IAM (팀 발급) | 이미지 업로드(이벤트 배너 등) API 호출 시 실패. 나머지 기능은 정상 |
| `AWS_REGION_STATIC_VALUE` | S3 리전 | 팀 공유 값 (운영은 `ap-northeast-2`) | 위와 동일 |
| `AWS_S3_BUCKET` / `AWS_S3_URL` | S3 버킷명 / 공개 URL | 팀 공유 값 | 위와 동일 |
| `SWAGGER_UI_ENABLED` | Swagger UI 노출 여부 (기본 `false`) | 로컬 개발 시 `true` 로 설정 | 미설정 시 기본값 `false` — `/swagger-ui.html` 404 |

---

## 5. DB 초기 적재

⚠️ **이 프로젝트는 테스트 DB와 운영 DB가 같은 인스턴스다.** 로컬에서 DDL 을 돌리면 **운영에 즉시 반영**된다. 스키마 변경 전 팀에 반드시 확인할 것 — 없는 DB에 새로 스키마를 만드는 경우가 아니면 함부로 `CREATE_`/`DROP_`/`MIGRATE_` 파일을 실행하지 않는다.

빈 DB에 운영과 동일한 현재 스키마를 만들 때 (`.claude/references/db/sql-folders.md` 기준), 아래 순서로 **번호 순** 실행:

1. `sql/V2/CREATE_03_TABLE_FUN.sql` — `fun_teams` (V3가 참조하는 `team_code`)
2. `sql/V2/CREATE_04_TABLE_SITE.sql` — `site_users` 등 site_* 본체
3. `sql/V3/CREATE_01_data_history_mode.sql`
4. `sql/V3/CREATE_02_data_player_legend.sql`
5. `sql/V3/CREATE_03_data_player_card.sql`
6. `sql/V3/CREATE_04_data_player_skill.sql`
7. `sql/V3/CREATE_05_fun.sql`
8. `sql/V3/CREATE_06_site_refresh_tokens.sql`
9. `sql/V3/CREATE_07_site_user_event.sql`
10. `sql/V3/CREATE_08_site_statistic_support_click.sql`

`CREATE_` 만 순서대로 실행하면 컬럼 하나 빠짐없이 운영과 같은 스키마가 나온다 (`.claude/references/db/sql-folders.md` 근거).

데이터 시드가 필요하면 `sql/V2_insert/`, `sql/V3_insert/` 안 동일 이름 파일을 `CREATE_` 이후 실행 (자동 실행 가능 등급).

`UPDATE_`/`ALTER_`/`DROP_`/`MIGRATE_` 접두사 파일은 **자동 실행 금지** — 사람이 파일 상단 주석을 읽고 전제조건을 확인한 뒤 개별 실행한다 (`.claude/references/db/sql-folders.md` 참고). 특히 `sql/V2/DROP_v1_tables.sql` 은 운영 데이터 삭제용이라 실행 금지 명시돼 있다.

---

## 6. 자주 막히는 곳

| 증상 | 원인 | 해결 |
|---|---|---|
| FE 에서 API 호출 시 CORS 에러 | `CorsConfig.java` 가 `http://localhost:3000` 만 허용 | FE dev 서버를 3000 포트로 띄우는지 확인 (`vite.config.js` 기본값 그대로 쓸 것) |
| BE 기동 시 `IllegalStateException: naver.redirect-uri must be set` | `.env.properties` 에 `NAVER_REDIRECT_URI` 누락 | § 4 표대로 채우기 |
| 네이버 로그인 콜백에서 리다이렉트 URI 불일치 에러 | 네이버 개발자센터 등록 콜백과 `NAVER_REDIRECT_URI` 값이 다름 | 로컬은 `http://localhost:8080/api/auth/naver/callback` 로 양쪽 통일 |
| BE 기동 시 DB 연결 실패 (`Communications link failure` 등) | `DB_HOST`/`DB_PORT`/`DB_NAME` 오타 또는 MariaDB 미기동 | 접속 정보 재확인, MariaDB 서비스 상태 확인 |
| `8080 포트 already in use` | 다른 프로세스가 8080 점유 | 해당 프로세스 종료 또는 `server.port` 를 로컬에서만 오버라이드 (커밋 금지) |
| `3000 포트 already in use` | 다른 Vite/Node 프로세스 실행 중 | 기존 프로세스 종료 후 `npm start` 재시도 |
| 이미지 업로드 API 500 | AWS S3 관련 env 키 미설정 | § 4 표의 `AWS_*` 4종 확인 |
| `/swagger-ui.html` 404 | `SWAGGER_UI_ENABLED` 기본값이 `false` | `.env.properties` 에 `SWAGGER_UI_ENABLED=true` 추가 |

---

## 7. 테스트 실행

BE 테스트 7건:

```powershell
.\gradlew.bat test
```
```bash
./gradlew test
```

대상 파일:
- `Com2usbaseballApplicationTests`
- `domain/fun/playerSkill/PlayerSkillMapperTest`
- `domain/analytics/service/support/AnalyticsEventGuardTest`
- `domain/fun/mileage/MileageMapperTest`
- `domain/fun/playerCard/PlayerCardMapperTest`
- `config/filter/AccessLogFilterTest`
- `domain/home/service/HomeServiceTest`

FE 테스트는 **현재 0건**이다 (`web/package.json` scripts 에 test 명령 없음).

---

## 8. 관련 문서

- [`../convention/backend.md`](../convention/backend.md) — BE 컨벤션 (인증 포함)
- [`../convention/frontend.md`](../convention/frontend.md) — FE 컨벤션
- `./api.md` — API 명세 (작성 예정)
- `./deploy.md` — 배포 절차 (작성 예정)
- `./database.md` — DB 구조 문서 (작성 예정)
- [`../../SETTING.md`](../../SETTING.md) — Claude agent · Figma 연동 셋업 (본 문서와 별개)
