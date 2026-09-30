---
adr: 0007
title: 시각 기준을 한국 시간(KST)으로 명시한다 — 3단계 전부 완료(2026-09-30 accepted)
status: accepted
date: 2026-09-27
created: 2026-09-27
updated: 2026-09-30
scope: web/src/domains/{coupons,events,admin}/**, src/main/java/**, application*.properties
related: rules/be/be-convention.md § 5
---

# 0007 시각 기준을 한국 시간(KST)으로 명시한다

## 배경

서버(JVM)·DB 커넥션·DDL(테이블 구조 정의) 어디에도 시간대(타임존)가 명시된 곳이 없었다. 지금 한국 시간(KST)으로 맞아 보이는 것은 서버가 우연히 한국 시간대의 OS 위에서 돌고 있기 때문일 뿐이다. 이 우연 위에 화면 코드 한 곳(`dateUtils.js` 의 `formatNow`)만 "서버가 KST 로 준다"고 명시적으로 가정하고 있었다.

**실제로 발생한 증상**: 관리자 화면 3곳(`AdminHomeTab.jsx`, `AdminCouponScreen.jsx`, `AdminEventScreen.jsx`)이 `new Date().toISOString().slice(0,10)` 로 "오늘 날짜"를 구했는데, `toISOString()` 은 세계협정시(UTC) 기준 문자열을 반환한다. 한국은 UTC+9 라서 자정~오전 9시 사이에는 하루 전 날짜가 나왔다 — 사용자가 본 "관리자 화면 하루 오차"의 정확한 원인이다.

## 결정 — 위험이 작은 것부터 3단계로 나눠 진행한다

| 단계 | 범위 | 되돌릴 수 있나 | 상태 |
|---|---|---|---|
| 1단계 (화면만) | FE 3파일의 `toISOString().slice(0,10)` 을 기존 `dateUtils` 유틸(KST 명시)로 교체 | 예 — FE 배포 롤백만으로 즉시 복원 | **완료** |
| 2단계 (+ 서버·DB 연결) | `spring.jackson.time-zone=Asia/Seoul`, JDBC URL `timezone=+09:00`(이름 `Asia/Seoul` 은 시간대 테이블이 없는 MariaDB 에서 세션 초기화가 실패해 **모든 쿼리가 500** — 2026-09-29 로컬 재현 후 오프셋으로 교체)(mariadb-java-client 3.3.3, 3.x 형식), `-Duser.timezone=Asia/Seoul` | 예 — 설정값 롤백으로 원복 | **완료** (v2.1.0 배포, PR #37 오프셋 방식 · 운영 EC2 OS 타임존 KST 전환 확인 2026-09-30) |
| 3단계 (+ DB 스키마) | `site_coupons`/`site_notices` 의 `created_at`/`updated_at` 을 `TIMESTAMP` → `DATETIME` 으로 통일 | 아니오 — `ALTER TABLE` 은 즉시 반영 | **완료** (2026-09-28 실행, `information_schema` 로 TIMESTAMP 잔존 0건 확인 — `applied/kst_timestamp_to_datetime.sql`) |

1단계부터 착수한 이유: 사용자가 실제로 본 증상을 정확히 이 3파일이 일으키고 있었고, 같은 도메인 안에 이미 정답 패턴(`formatNow()`)이 있어 새 코드 작성이 거의 필요 없었으며, DB·서버를 안 건드려 위험이 0에 가까웠다.

## 왜 (대안과 비교)

| 대안 | 문제 | 판정 |
|---|---|---|
| 한 번에 3단계를 모두 적용한다 | 3단계(DDL)는 test DB = 운영 DB 동일 인스턴스라 되돌릴 수 없다. 화면 버그(1단계)를 고치자고 되돌릴 수 없는 스키마 변경까지 한 커밋에 묶는 것은 과하다 | 기각 |
| 아무것도 안 하고 지금 상태(OS 타임존에 우연히 의존)를 유지한다 | 서버 이전·OS 재설치·리전 변경·컨테이너화가 일어나는 순간 `TIMESTAMP` 컬럼과 `DATETIME` 컬럼이 서로 다른 시각을 보여주기 시작한다 | 기각 |
| 2단계(서버 설정)를 먼저 하고 화면은 나중에 고친다 | 세션 타임존이 실제로 생기는 순간 `TIMESTAMP` 컬럼(`site_coupons`/`site_notices` 의 `created_at`/`updated_at`)이 지금까지와 다른 값을 반환할 수 있어, 사용자가 본 화면 버그보다 먼저 손댈 이유가 없다 | 기각 — 순서를 바꿔 착수 |

## MariaDB 의 핵심 원리

`TIMESTAMP` 컬럼은 읽고 쓸 때 **세션 타임존으로 변환**되고, `DATETIME` 컬럼은 **입력한 값 그대로** 저장·조회된다. `site_coupons`(`expire_at` 은 DATETIME, `created_at`/`updated_at` 은 TIMESTAMP)와 `site_notices`(구조 동일)는 같은 테이블 안에서 타입이 섞여 있어 이 문제에 실제로 노출돼 있다. `sql/V3/` 이후 신규 테이블은 전부 `DATETIME` 으로 통일돼 있다 — V2 잔재만 문제다.

## admin 날짜 입력 보정 — 관련 결정

관리자가 `YYYY-MM-DD` 만 고르면 서버가 시작 `12:00:00`/종료 `23:59:59` 를 자동으로 채우는 정책도 같은 조사에서 함께 확정했다. 세 가지 방식(FE 조합 / BE 서비스 보정 / mapper SQL 가공) 중 **BE 서비스 레이어 보정**을 택했다 — admin 외 경로(배치·API)에서도 항상 적용되고, 이미 `AdminNoticeServiceImpl` 에 "null 이면 now() 로 채운다" 는 동일 패턴 선례가 있어 컨벤션과 맞았다. FE 조합 방식은 FE 를 거치지 않으면 무력화되는 문제로, mapper SQL 가공은 INSERT/UPDATE 양쪽에 로직이 흩어지는 문제로 기각했다.

## 영향받는 곳

- `web/src/domains/{admin,coupons,events}/mobile/**` — 1단계 완료분
- `application.properties` · `application-prod.properties` — 2단계, v2.1.0 으로 배포 완료
- `sql/v.2.0.0/01_site.sql` (`site_coupons`, `site_notices`) — 3단계 반영 완료, DDL 은 DATETIME
- `sql/v.2.0.0/applied/kst_timestamp_to_datetime.sql` — 3단계 실행 SQL(적용 완료). `sql/draft/kst-timezone/` 은 전 단계 완료로 2026-09-30 삭제
- `rules/be/be-convention.md` § 5 — "시각 명시는 ❓ D8, 확정 전 `TIMESTAMP` 컬럼 신설 금지, `DATETIME` 만" → "`DATETIME` 만 쓴다(0007 확정)" 로 갱신

## 아직 미정인 것 (❓ D8)

1. ~~운영 EC2 인스턴스의 OS 타임존이 실제로 무엇인가~~ → 확정(2026-09-30): KST 로 변경 완료
2. ~~JDBC 타임존 파라미터 도입 시 기존 `TIMESTAMP` 값 해석 변경 여부~~ → 결정됨: `timezone=Asia/Seoul` 적용(mariadb-java-client 3.3.3 형식). 적용 전후 값 비교는 실제 배포 시 `sql/draft/kst-timezone/00_check.sql`·`04_verify.sql` 대조로 수행
3. ~~3단계 대상에 `site_coupons`/`site_notices` 외에 레거시 `users`/`coupons`/`events`(현재 dual-write 중)도 포함할지, 그 정리가 끝난 뒤로 미룰지~~ → 확정(2026-09-30): 레거시 테이블 포함 KST 정리 완료
4. ~~admin 날짜 보정 정책 — 종료 시각을 리터럴 `23:59:59` 로 할지 기존 관례 `23:59:00`(분 단위) 로 유지할지, 백필 실행 여부~~ → 확정(2026-09-30): 종료 시각 `23:59:59` 로 수정 완료 확인
