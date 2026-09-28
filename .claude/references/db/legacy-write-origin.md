# legacy 테이블 쓰기 원인 규명

조사일: 2026-08-20 · 조사 브랜치: `v2.0.0-refactor-mobile` (읽기 전용 비교 대상: `master`)

> **결정 (2026-08-20, 본 조사 이후)**: kbo 6종 완전 삭제 + kbocrol 폴더 삭제 확정. 아래 §2 kbocrol 서술은 삭제 결정 이전 조사 기록으로 보존.

## §1 결론 요약

| legacy 테이블 | 무엇이 쓰고 있는가 |
|---|---|
| `users` | **운영에 배포된 `master` 브랜치 BE 코드**. 네이버 OAuth 로그인 시마다 `last_login_at` UPDATE + 신규 유저 INSERT (`/api/auth/naver/callback`) |
| `user_roles` | 위와 동일 경로 — 신규 유저 최초 로그인 시 `INSERT INTO user_roles` (role=USER 기본 부여) |
| `coupons` | **`master` 브랜치 관리자 API** — `POST/PATCH /api/admin/coupons` (쿠폰 등록/수정/노출토글) |
| `events` | **`master` 브랜치 관리자 API** — `POST/PATCH /api/admin/events` (이벤트 등록/수정/노출토글) |
| `posts` | 미규명 — `master` 에 `PostMapper.xml` 이 존재하나 본 조사 범위(§ 3 요청 대상)에 포함되지 않아 쓰기 경로 미추적. 최종 갱신 2026-02-08 로 최근 활동 아님 |

핵심: **현재 개발 중인 `v2.0.0-refactor-mobile` 브랜치 코드는 legacy 4테이블에 전혀 쓰지 않는다** (`site_users`/`site_coupons`/`site_events` 로 전부 이관됨). 실측된 legacy 갱신은 **운영 서버가 여전히 `master` 기준 구코드로 떠 있기 때문**으로 설명됨 — 코드 근거 확보, §6 미확인 항목 없음.

## §2 kbocrol 정체

| 항목 | 내용 |
|---|---|
| 정체 | Python 크롤러 + gRPC 서버 (`kbocrol/src/main.py`). 네이버 스포츠 API 에서 KBO 경기/선수 데이터 수집 |
| 쓰기 대상 테이블 | `kbo_games` (경기 UPSERT), `kbo_players` (선수 마스터 UPSERT), `kbo_batter_logs` (타자 기록 UPSERT) — **legacy 4테이블과 무관** |
| 접속 DB | `kbocrol/src/common/config.py` 하드코딩 `database: "compyafun"` — 실측 표의 DB 와 동일 스키마로 추정 (동일 DB 안에 legacy + KBO + V2 테이블 공존) |
| 실행 방식 | 코드 내부 APScheduler (`src/app/scheduler.py`, in-process cron) — `09:00` 선발투수, `23:30` 경기결과, `23:45` 타자기록. OS 레벨 cron/서비스 등록 파일(`*.bat`, `*.sh`, `Dockerfile`, systemd unit) 은 리포지토리 내 없음 |
| 근거 | `kbocrol/kbo_server.log` 최종 기록 2026-04-03 — 로컬 개발 실행 로그로 보이며 운영 서버 실행을 증명하진 않음. 실측 `kbo_games` 최종갱신 2026-08-20 09:00 은 스케줄 시각(`09:00 선발투수`)과 일치 → **어딘가에서 계속 가동 중은 확실**, 다만 정확한 호스트/운영 방식은 리포지토리 밖 정보라 미규명 |

## §3 스케줄러 / 배치

| 클래스 | 주기 | 대상 테이블 | 활성 여부 |
|---|---|---|---|
| `kbocrol/src/app/scheduler.py` (`run_starter_job`) | 매일 09:00 | `kbo_games` | 활성 (실측 갱신시각과 일치) |
| `kbocrol/src/app/scheduler.py` (`run_game_result_job`) | 매일 23:30 | `kbo_games` | 활성 추정 |
| `kbocrol/src/app/scheduler.py` (`run_batter_job`) | 매일 23:45 | `kbo_players`, `kbo_batter_logs` | 활성 추정 |
| BE(`src/main/java/**`) `@Scheduled`/`@EnableScheduling` | — | — | **없음** — 현재 브랜치·`master` 브랜치 모두 `git grep` 결과 0건. Java 측 배치/스케줄러 자체가 존재하지 않음 |

## §4 legacy 테이블 쓰기 경로

현재 브랜치(`v2.0.0-refactor-mobile`)의 `src/main/resources/mapper/site/**` 는 전부 `site_users`/`site_coupons`/`site_events` 대상이라 legacy 테이블 쓰기 SQL 이 **없음**. 아래는 `master` 브랜치(운영 배포 추정) 기준 경로.

| 테이블 | 쓰기 SQL 위치 (master) | 호출 체인 | 활성 여부 |
|---|---|---|---|
| `users` | `mapper/UserMapper.xml` `insertUser`/`updateUserLogin` | `GET /api/auth/naver/callback` (`AuthController`) → `UserServiceImpl.findOrCreateNaverUser` → `UserRepository.save`/`updateUserLastLogin` → `UserMapper.insertUser`/`updateUserLogin` | 활성 — 네이버 로그인 시마다 실행, 실측 오늘 22:40 갱신과 부합 |
| `user_roles` | `mapper/UserMapper.xml` `insertUserRole` | 위 체인 내부 — 신규 유저 최초 로그인 시 1회 `repository.checkIsExistRole` false → `repository.saveRole` → `insertUserRole` (role=USER, status=ACTIVE 고정) | 활성 — 신규 가입자 있을 때만 갱신 (실측 08-14, 로그인 대비 빈도 낮은 것과 부합) |
| `coupons` | `mapper/coupon/CouponMapper.xml` `INSERT/UPDATE INTO coupons` | `POST/PATCH /api/admin/coupons`, `/api/admin/coupons/{id}`, `/{id}/visible` (`AdminCouponController`) → `CouponAdminServiceImpl` → `CouponRepository` → `CouponMapper` | 활성 — 관리자 수동 조작시에만, 실측 08-12 이후 미갱신과 부합(운영 관리자 작업 뜸함) |
| `events` | `mapper/event/EventMapper.xml` `INSERT/UPDATE INTO events` | `POST/PATCH /api/admin/events`, `/api/admin/events/{id}`, `/{id}/visible` (`AdminEventController`) → `EventAdminServiceImpl` → `EventRepository` → `EventMapper` | 활성 — 위와 동일 패턴 |

## §5 브랜치 차이

| 구분 | `master` (운영 배포 추정) | `v2.0.0-refactor-mobile` (현재) |
|---|---|---|
| divergence 지점 | 공통 조상 `7baa067` (2026-04-03) | 이후 `1d9d119` "DB TABLE 변경으로 인해 신규 TABLE 구조 ENTITY 생성" 부터 분기 |
| 대상 테이블 | `users`, `user_roles`, `coupons`, `events` (legacy, `site_` 접두어 없음) | `site_users`, `site_coupons`, `site_events` (`site_` 접두어, `RefreshTokenMapper` 로 세션 분리) |
| mapper 경로 | `src/main/resources/mapper/{UserMapper,coupon/CouponMapper,event/EventMapper}.xml` | `src/main/resources/mapper/site/{oauth/UserMapper,coupon/CouponMapper,event/EventMapper}.xml` |
| 환경설정 | `application.properties` 단일 파일, `application-prod.properties` **없음** (master 에 파일 자체가 없음 — 단일환경 구조) | `application.properties` + `application-prod.properties` 분리 (dev/prod 분기 도입) |
| 최근 커밋 | `7baa067` 2026-04-03 이후 정지 (약 4.5개월 미갱신) | 계속 진행 중 (최신 `4170408` 2026-08-20 대) |
| 해석 | master 는 4월 초 이후 코드 변경이 없는데 legacy 테이블은 8월까지 계속 갱신 → **그 시점부터 지금까지 운영 서버가 master 기준 바이너리를 그대로 재시작 없이(또는 동일 버전으로) 계속 서빙 중**이라는 정황과 일치 | v2 라인은 아직 legacy 데이터 마이그레이션/컷오버가 없는 상태로 보임 — `site_coupons`(정지 2026-04-03), `site_events`(정지 2026-04-04) 갱신도 그 시점에 멈춰 있어 **v2 관리자 화면이 실제 운영 트래픽을 받은 적이 사실상 없음**을 시사 |

## §6 코드로 설명 안 되는 갱신

| 항목 | 내용 |
|---|---|
| kbocrol 실행 주체 | 리포지토리 안에는 OS 스케줄러 등록 파일이 없어 "누가/어디서 이 프로세스를 상시 기동해 두는지" 는 코드로 설명 안 됨 — 운영 서버 또는 로컬 PC 상시 실행 여부는 사용자 확인 필요 |
| `posts` 테이블 최근 갱신 여부 | 이번 조사 범위(§3 지시 대상: users/user_roles/coupons/events)에 포함되지 않아 `master` `PostMapper.xml` 쓰기 경로를 추적하지 않음. 실측 최종갱신 2026-02-08 로 최근성 낮아 후순위 처리했으나, 필요시 별도 조사 권고 |
| 운영 서버가 정확히 `master` 브랜치 그 자체인지 | git 상 확인 가능한 것은 "legacy 스키마를 쓰는 코드 라인이 `master` 에만 존재하고 divergence 이후 갱신이 없다" 는 정황뿐. 실제 배포 서버의 배포 스크립트/CI 로그/서버 접속 등은 리포지토리에 없어 **100% 단정은 불가** — 정황 일치로 결론 냈으나 배포 이력(CI/CD, 서버 SSH 확인) 으로 교차검증 권고 |
