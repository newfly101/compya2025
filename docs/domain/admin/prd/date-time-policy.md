# admin 날짜 입력 → DB 저장 시각 처리 정책

> 관리자가 `YYYY-MM-DD` 만 고르면 저장 시 자동으로 시작 `12:00:00` / 종료 `23:59:59` 를 채우는 정책의 실측 + 설계.
> 대상: events(이벤트), coupons(쿠폰). quiz·notices 는 실측 결과 대상 아님(아래 근거 참조).

---

## 1. 실측 표

| 도메인 | DB 컬럼·타입 | DTO 자바 타입·포맷 | mapper 처리 | FE input | FE 전송 문자열 | 현재 저장 시각 |
|---|---|---|---|---|---|---|
| **events.start_at** | `DATETIME NOT NULL` | `LocalDateTime` `@JsonFormat("yyyy-MM-dd HH:mm")` | `#{startAt}` 그대로 바인딩, 가공 없음 | `type="date"` (`AdminDateRange`) | `"2026-09-09"` (날짜만, 시각 미부착) | **파싱 실패로 저장 자체가 안 됨 (버그)** |
| **events.expire_at** | `DATETIME NOT NULL`, CHECK `expire_at > start_at` | 동일 | 동일 | 동일 | 동일 | 동일 (버그) |
| **coupons.expire_at** | `DATETIME NOT NULL` | `LocalDateTime` `@JsonFormat("yyyy-MM-dd HH:mm")` | `#{expireAt}` 그대로 바인딩 | `type="date"` | FE 가 제출 시 `` `${date} 23:59` `` 로 조합해서 보냄 | `YYYY-MM-DD 23:59:00` (이미 정책 절반 구현됨) |
| coupons (시작일) | — | — | — | — | — | **컬럼 자체가 없음** — 쿠폰은 만료일만 있고 시작일 개념 없음 |
| quiz | `fun_quiz` 에 날짜 컬럼 없음(`round INT` 로만 회차 구분) | `QuizRequest(round, imageUrl)` | — | — | — | **대상 아님** |
| notices.published_at | `DATETIME NULL` | `LocalDateTime` `@JsonFormat("yyyy-MM-dd HH:mm")` | `#{publishedAt}` | **admin 글쓰기 화면에 입력 필드 자체가 없음** | 미전송(null) | BE 서비스가 `null` 이면 `LocalDateTime.now()` 로 자동 채움 (이미 Option B 방식 선례) |

**근거 파일:줄**
- `sql/V2/site/CREATE_TABLE_SITE.sql:7`(coupons.expire_at), `:27`(notices.published_at), `:50-51`(events.start_at/expire_at), `:60-61`(CHECK 제약)
- `sql/V2/fun/CREATE_TABLE_FUN.sql:127-136`(fun_quiz — 날짜 컬럼 없음)
- `src/main/java/.../event/dto/request/EventRequest.java:11-14`
- `src/main/java/.../coupon/dto/request/CouponRequest.java:11-12`
- `src/main/java/.../notice/dto/request/NoticeRequest.java:17-18`
- `src/main/java/.../notice/service/AdminNoticeServiceImpl.java:68-70` (published_at 자동 채움 로직, 선례)
- `src/main/resources/mapper/site/event/EventMapper.xml:64-83`(INSERT, 가공 없음), `:90-109`(UPDATE)
- `src/main/resources/mapper/site/coupon/CouponMapper.xml:26-70`
- `web/src/global/ui/admin/fields/AdminDateRange.jsx:7-21` (`type="date"` 2개, 시각 미조합)
- `web/src/domains/events/mobile/admin/AdminEventScreen.jsx:274-282`(handleSubmit — 시각 조합 로직 없음), `:42-57`(폼 상태 slice(0,10))
- `web/src/domains/events/store/admin/dto.js`(baseEventDTO — startAt/expireAt 그대로 통과)
- `web/src/domains/coupons/mobile/admin/AdminCouponScreen.jsx:194-201`(handleSubmit — `` `${form.expireAt} 23:59` `` 조합, 이미 구현됨)
- 실데이터: `sql/V2/site/INSERT_SITE_EVENTS_DATA.sql`(21건 중 19건이 `12:00:00 ~ 23:59:00` 패턴, 2건 예외 — id=1 `00:00:00` 시작, id=11 `00:00:00` 시작 · `10:00:00` 종료), `sql/V2/site/INSERT_SITE_COUPONS_DATA.sql`(28건 전부 `23:59:00`)

**DATE 타입 컬럼**: 조사 대상 4개 컬럼(events.start_at/expire_at, coupons.expire_at, notices.published_at) 전부 `DATETIME` — `DATE` 타입 컬럼 없음. **마이그레이션(컬럼 타입 변경) 불필요.**

---

## 2. 타임존 결론

> **결론(실측 확정)**: KST 로 `2026-09-09` 를 고르면, FE→BE 로 전달되는 `LocalDateTime` 리터럴(`2026-09-09 23:59`)이 그대로 MariaDB `DATETIME` 컬럼에 문자 그대로 저장된다 — **JVM 타임존/DB 세션 타임존과 무관하게 값이 그대로 박힌다.** `DATETIME` 은 MySQL/MariaDB 에서 타임존 개념이 없는 "벽시계 시각" 타입이고, JDBC 드라이버가 `LocalDateTime` → `DATETIME` 바인딩 시 타임존 변환을 하지 않기 때문이다(반면 `TIMESTAMP` 타입은 세션 `time_zone` 기준으로 UTC 변환 저장 — 아래 예외 참고).

**근거**
- `src/main/resources/application.properties:11`, `application-prod.properties:11` — JDBC URL 에 `serverTimezone` 파라미터 없음
- `spring.jackson.time-zone` 설정 전체 검색 결과 없음
- `TimeZone.setDefault` / `ZoneId.of("Asia/Seoul")` 코드 전체 검색 결과 없음
- 리포지토리 내 Dockerfile/docker-compose 없음 — 컨테이너 `TZ` env 는 리포지토리 밖(배포 인프라)에 있어 **확인 불가**

**예외 — TIMESTAMP 타입 컬럼**: `site_coupons.created_at/updated_at`, `site_notices.created_at/updated_at` 는 `TIMESTAMP` 이고 `NOW()`/`CURRENT_TIMESTAMP` 로 채워진다(mapper 의 SQL 함수 호출, 예: `CouponMapper.xml:64-65`). 이 값은 **MariaDB 서버 자체의 세션 `time_zone` 설정**에 의존한다 — 코드로 확인 불가, **런타임에 `SELECT @@global.time_zone, @@session.time_zone;` 을 운영 DB 에서 직접 확인해야 한다**(본 조사는 DB 접속 금지 제약으로 미수행). 단, 이 컬럼들은 감사(audit) 용도이지 이번 정책(시작/종료 일시) 대상이 아니다.

**FE 부수 버그(타임존 관련, 발견)**: `AdminEventScreen.jsx:69`, `AdminCouponScreen.jsx:37` 의 `todayStr()` 이 `new Date().toISOString().slice(0,10)` 를 쓴다 — `toISOString()` 은 **UTC 기준**이다. KST 새벽 00:00~08:59 사이에는 UTC 날짜가 하루 전날이라 "진행중/종료" 판정(`isEnded`, `isExpired`)이 하루 어긋난다. 이번 정책과 별개 버그지만 같은 파일·같은 날짜 로직이라 같이 고치는 게 효율적이다.

---

## 3. 문제점

1. **[버그, 최우선] events 등록/수정이 현재 동작하지 않을 가능성이 높다.** `EventRequest.startAt/expireAt` 는 `@JsonFormat(pattern="yyyy-MM-dd HH:mm")` 인데, FE(`AdminDateRange` + `AdminEventScreen.jsx:274-282`)는 시각을 조합하지 않고 `"2026-09-09"` 형태의 날짜만 보낸다. Jackson 의 `LocalDateTimeDeserializer` 는 지정된 포맷과 정확히 일치해야 파싱되므로, `"2026-09-09"` 는 `"yyyy-MM-dd HH:mm"` 패턴에 매칭되지 않아 `DateTimeParseException` → 400 에러가 날 것으로 보인다(coupons 는 `handleSubmit` 에서 `${form.expireAt} 23:59` 로 미리 시각을 붙여 이 문제를 우회하고 있음 — events 는 같은 처리가 빠짐). 즉 이번 정책 작업은 "정책 신설" 이 아니라 **이미 깨진 events 시각 조합 로직을 고치면서 정책을 얹는 작업**이다.
2. **DTO 포맷이 초(seconds) 단위를 지원하지 않는다.** `@JsonFormat(pattern="yyyy-MM-dd HH:mm")` 는 분 단위까지만 파싱한다 — 사용자가 요청한 리터럴 `23:59:59` 를 그대로 받으려면 패턴에 `:ss` 를 추가해야 한다(§5 변경 대상 참고). 현재 관례(coupons 실데이터 28건 전부, events 실데이터 19/21건)는 `23:59:00`(초 단위 없이 `HH:mm` 그대로, 즉 사실상 "23:59") 이다 — §7 사용자 결정 필요 참고.
3. **BE 에 startAt < expireAt 사전 검증이 없다.** DB 의 `CHECK (expire_at > start_at)` (site_events) 에만 의존한다. 위반 시 서비스 레이어가 아닌 SQL 제약 위반 예외가 그대로 올라가 사용자에게 불친절한 에러가 노출될 수 있다.
4. **경계 비교 연산자 위험은 실질적으로 없다.** BE/FE 어디에도 "진행중/종료" 를 `start_at <= NOW() AND expire_at >= NOW()` 식으로 서버가 판정하는 코드가 없다(`EventMapper.xml`, `CouponMapper.xml`, `EventUserServiceImpl.java` 확인 — 전부 `is_visible` 필터만 있고 날짜 범위 WHERE 없음). "진행중/종료" 뱃지는 FE 가 `expireAt.slice(0,10) < todayStr()` 로 **날짜 문자열만** 비교한다(`AdminEventScreen.jsx:73-76`, `AdminCouponScreen.jsx:39-42`). 따라서 `00:00:00 → 23:59:59` 로 시각이 바뀌어도 이 비교 로직은 영향받지 않는다 — 하루 짧아지거나 길어지는 회귀 없음.
5. **`DATETIME(3)` 등 소수초 정밀도 컬럼이 없다.** 전부 초 단위(fractional seconds 미지정) `DATETIME` 이므로 "23:59:59.5 가 잘리는" 함정은 실재하지 않는다. `23:59:59` 든 `< date+1day` 든 정밀도 문제로 인한 차이는 없다 — 다만 서버 측 범위 판정 로직 자체가 없으므로(4번) 이 논의는 향후 배치/API 추가 시에만 의미가 있다.
6. **FE 노출 판정의 타임존 버그**(§2 FE 부수 버그) — 이번 정책과 함께 고치는 것을 권고.
7. **user-facing 카드에 원본 datetime 문자열이 그대로 노출됨.** `EventCard.jsx:34`, `CouponCard.jsx:35` 가 `event.startAt`/`coupon.expireAt` 를 가공 없이 렌더링 — 정책 적용 후 `"2026-09-09 12:00 ~ 2026-09-09 23:59"` 식으로 시각까지 사용자에게 보일 수 있다(현재도 coupons 는 이미 이렇게 보이고 있음). 이번 정책 범위는 아니지만 부작용으로 언급.

---

## 4. 정책 확정안

### 4.1 레이어 선택 — **(B) BE 서비스 레이어 보정**

| 기준 | A: FE 조합 | B: BE 서비스 보정 | C: mapper SQL 가공 |
|---|---|---|---|
| admin 외 경로(배치/API)에서도 지켜지나 | ❌ FE 를 거치지 않으면 무력화 | ✅ 서비스 진입점에서 항상 적용 | ✅ 하지만 INSERT/UPDATE 양쪽에 흩어짐 |
| 기존 데이터 일관성 | 현재 coupons 가 이미 A 로 하고 있으나 events 는 누락 — 한 곳에 몰아야 버그 재발 안 함 | 한 곳(서비스)에서만 규칙 관리 | 매 mapper 마다 CONCAT 반복, 유지보수 어려움 |
| UPDATE 시 기존 시각 보존 | FE 가 항상 새로 조합 → 기존 값 유실 위험 | 서비스에서 "날짜만 바뀌었나/시각도 있나"로 분기 가능 | SQL 조건 분기가 지저분함 |
| 테스트 용이성 | E2E/브라우저 필요 | 단위 테스트로 충분 | mapper 통합 테스트 필요 |

**권고: (B).** 이미 `AdminNoticeServiceImpl.java:68-70` 에 "null 이면 now() 로 채운다" 형태의 동일 패턴 선례가 있어 팀 컨벤션과 맞고, admin 화면 개편이나 향후 배치 등록 경로가 추가돼도 정책이 깨지지 않는다.

**구체 규칙(서비스 레이어)**:
- `EventAdminServiceImpl.createEvent/updateEvent`, `AdminCouponServiceImpl.createCoupon/updateCoupon` 진입 시:
  - `startAt` 이 "시각 없이 자정(00:00)"으로 들어오면(= FE 가 날짜만 보냈다는 신호) `12:00:00` 으로 보정. FE 가 이미 시각을 실어 보냈다면(향후 datetime-local 등 확장 시) 그대로 둔다.
  - `expireAt` 이 "자정(00:00)"으로 들어오면 `23:59:59` 로 보정, 아니면 그대로 둔다.
  - 판정 기준은 "시:분:초가 정확히 00:00:00 인가" — FE 가 `type="date"` 인 이상 항상 00:00:00 으로 들어오므로 사실상 매번 보정된다. 향후 시각까지 받는 UI 가 생기면 자연히 보정을 건너뛴다.
- **UPDATE 시 기존 값 덮어쓰지 않기**: FE 는 수정 폼을 열 때 `expireAt.slice(0,10)` 로 날짜만 보여주고(`formOf`, `AdminEventScreen.jsx:52-53`, `AdminCouponScreen.jsx:72`) 있어, 관리자가 날짜를 그대로 두고 다른 필드만 고쳐도 요청에는 항상 `00:00:00` 이 실려 온다 — 즉 "기존 23:59:59 를 보존" 이 불가능한 구조다. **이 정책 하에서는 수정 시에도 항상 재보정(23:59:59/12:00:00)이 맞다** — 관리자가 화면에서 날짜를 그대로 두면 시각도 그대로(23:59:59) 나오는 게 자연스럽고, 날짜를 바꾸면 새 날짜의 23:59:59 로 다시 채워지는 게 기대 동작이다.

### 4.2 엣지 케이스 처리 방침

| 케이스 | 방침 |
|---|---|
| 수정 화면에 기존 `23:59:59` 가 어떻게 보이나 | `type="date"` input 은 `expireAt.slice(0,10)` 만 보여줌(시각 정보는 화면에 안 보임, 현재도 동일) — 저장 시 서비스가 다시 `23:59:59` 로 채우므로 결과적으로 유지됨 |
| 시작 `12:00:00` 기본값 vs 강제값 | **기본값으로 제안(A안)** — 실데이터에 예외가 이미 존재한다(`INSERT_SITE_EVENTS_DATA.sql` id=11: 시작 `00:00:00`/종료 `10:00:00`, 오전 마감 이벤트로 추정). 강제(B안)하면 이런 케이스를 관리자가 다시는 못 만든다. 단, 현재 FE 는 `type="date"` 뿐이라 시각을 직접 지정할 UI가 없다 — §7 사용자 결정 필요 참고 |
| 시작일 > 종료일 검증 | 현재 DB CHECK 제약(`chk_site_events_expire_after_start`)에만 의존, BE 사전 검증 없음. **서비스 레이어에 `if (startAt.isAfter(expireAt)) throw BaseException(...)` 추가 권고** — DB 제약 위반보다 친절한 400 메시지를 줄 수 있음. coupons 는 시작일 자체가 없어 해당 없음 |
| 기존 데이터 백필 | §4.3 참고 |

### 4.3 백필(backfill) 필요 여부 및 SQL 초안 (⚠️ 초안만, 실행 금지)

실데이터 확인 결과 대부분 이미 관례를 따르고 있어(events 19/21건, coupons 28/28건이 `12:00:00`/`23:59:00` 패턴) **전면 백필은 불필요**하다. 예외 2건(events id=1, id=11)은 의도된 값으로 보여 **자동 백필 대상에서 제외**하고 수동 확인을 권고한다. 다만 정책을 "초 단위까지 23:59:59" 로 확정할 경우, 기존 `23:59:00` 데이터와 신규 `23:59:59` 데이터가 섞여 데이터 일관성이 깨지므로 아래 초안을 참고용으로 남긴다.

```sql
-- ⚠️ 초안. 실행 금지. §7 사용자 결정(23:59:59 리터럴 채택 여부) 확정 후 검토.
-- 대상: 시:분:초가 '00:00:00' 인 채로 저장된(=날짜만 입력됐던) 레거시 행만 보정.
-- events: 시작 00:00:00 → 12:00:00 (id=1, id=11 은 의도된 값일 수 있어 WHERE 로 자동 제외되지 않음 — 수동 확인 후 별도 처리 권고)
UPDATE site_events
SET start_at = DATE(start_at) + INTERVAL 12 HOUR
WHERE TIME(start_at) = '00:00:00';

-- events: 종료 시각이 정확히 23:59:00 인 행을 23:59:59 로 통일(정책을 초 단위로 확정한 경우에만)
UPDATE site_events
SET expire_at = DATE(expire_at) + INTERVAL 86399 SECOND  -- 23:59:59
WHERE TIME(expire_at) = '23:59:00';

-- coupons: 동일 로직
UPDATE site_coupons
SET expire_at = DATE(expire_at) + INTERVAL 86399 SECOND
WHERE TIME(expire_at) = '23:59:00';
```

---

## 5. 변경 대상 목록

### BE
| 파일 | 줄 | 변경 |
|---|---|---|
| `src/main/java/com/dawne/com2usbaseball/domain/event/dto/request/EventRequest.java` | 11, 13 | `@JsonFormat` 패턴에 `:ss` 추가할지 여부 결정 후 반영(§7) — 최소한 FE 가 시각까지 보내도록 맞추거나 서비스 보정 도입 |
| `src/main/java/com/dawne/com2usbaseball/domain/event/dto/response/EventResponse.java` | 12, 14 | 응답도 동일 패턴 맞추기(왕복 일관성) |
| `src/main/java/com/dawne/com2usbaseball/domain/coupon/dto/request/CouponRequest.java` | 11 | 동일 |
| `src/main/java/com/dawne/com2usbaseball/domain/coupon/dto/response/CouponResponse.java` | 12 | 동일 |
| `src/main/java/com/dawne/com2usbaseball/domain/event/service/EventAdminServiceImpl.java` | createEvent/updateEvent 메서드 내부 | startAt `00:00:00`→`12:00:00`, expireAt `00:00:00`→`23:59:59` 보정 로직 + startAt>expireAt 검증 추가 |
| `src/main/java/com/dawne/com2usbaseball/domain/coupon/service/AdminCouponServiceImpl.java` | createCoupon/updateCoupon 메서드 내부 | expireAt `00:00:00`→`23:59:59` 보정 로직 추가 |

### FE
| 파일 | 줄 | 변경 |
|---|---|---|
| `web/src/domains/events/mobile/admin/AdminEventScreen.jsx` | 274-282 (`handleSubmit`) | **최우선 버그 수정** — 현재 시각 미조합으로 등록/수정이 실패할 가능성. BE 가 보정하게 되면(4.1) FE 는 날짜만 보내도 되지만, 그 전까지는 최소 `startAt: `${form.startAt} 12:00`, expireAt: `${form.expireAt} 23:59`` 조합 필요(coupons 와 동일 패턴) |
| `web/src/domains/events/mobile/admin/AdminEventScreen.jsx` | 69 (`todayStr`) | `toISOString()` → KST 로컬 날짜 계산으로 교체 (예: `Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'})` 또는 `date-fns-tz`) |
| `web/src/domains/coupons/mobile/admin/AdminCouponScreen.jsx` | 37 (`todayStr`) | 동일 |
| `web/src/domains/coupons/mobile/admin/AdminCouponScreen.jsx` | 200 | BE 보정 도입 시 `${form.expireAt} 23:59` 조합 로직 제거 가능(중복 방지) — 단, BE 배포 전까지는 유지 |

### DB 마이그레이션
- **불필요.** 컬럼 타입은 이미 전부 `DATETIME`.

### 기존 데이터 백필
- §4.3 SQL 초안 참고. **실행 여부는 §7 사용자 결정에 달림.** 기본 권고는 "미실행"(현재 관례가 이미 사실상 정책과 동일하므로).

---

## 6. 수정 dispatch brief (다른 agent 그대로 실행용)

```
목적: admin 이벤트/쿠폰 등록 시 날짜만 입력해도 서버가 자동으로
      시작 12:00:00 / 종료 23:59:59 를 채우도록 하고, 현재 깨져 있는
      events 등록/수정(시각 미조합으로 인한 파싱 실패 추정)을 함께 고친다.

범위 A (BE, Edit 가능 — 아래 파일만):
  - src/main/java/com/dawne/com2usbaseball/domain/event/dto/request/EventRequest.java
  - src/main/java/com/dawne/com2usbaseball/domain/event/dto/response/EventResponse.java
  - src/main/java/com/dawne/com2usbaseball/domain/event/service/EventAdminServiceImpl.java
  - src/main/java/com/dawne/com2usbaseball/domain/coupon/dto/request/CouponRequest.java
  - src/main/java/com/dawne/com2usbaseball/domain/coupon/dto/response/CouponResponse.java
  - src/main/java/com/dawne/com2usbaseball/domain/coupon/service/AdminCouponServiceImpl.java
  작업:
  1. @JsonFormat 패턴을 "yyyy-MM-dd HH:mm:ss" 로 변경(§7 A안 채택 시) — B안(HH:mm 유지) 채택 시 이 항목 스킵.
  2. EventAdminServiceImpl.createEvent/updateEvent, AdminCouponServiceImpl.createCoupon/updateCoupon 에서
     시:분:초가 00:00:00 인 startAt → 12:00:00, expireAt → 23:59:59(또는 23:59:00, §7 결정에 따름)로 보정.
  3. EventAdminServiceImpl 에 startAt.isAfter(expireAt) 시 BaseException 던지는 사전 검증 추가.
  제약: mapper XML 은 수정 불필요(가공 없는 순수 바인딩 유지). DB 스키마 변경 금지.

범위 B (FE, Edit 가능 — 아래 파일만):
  - web/src/domains/events/mobile/admin/AdminEventScreen.jsx
  - web/src/domains/coupons/mobile/admin/AdminCouponScreen.jsx
  작업:
  1. AdminEventScreen.jsx handleSubmit — BE 보정이 배포되기 전까지 임시로 coupons 와 동일하게
     startAt/expireAt 에 " 12:00"/" 23:59" 를 붙여 전송(BE 배포 후에는 제거 가능하니 주석으로 표시).
  2. 두 파일의 todayStr() — new Date().toISOString().slice(0,10) 을 KST 기준 로컬 날짜 계산으로 교체.
  3. AdminCouponScreen.jsx handleSubmit 의 기존 " 23:59" 조합은 BE 보정 완료 후 제거(중복 방지) — 이번 라운드에서는 유지해도 무방.
  제약: BE DTO 파일 Edit 금지.

산출 후 메인 보고 — 300줄 이하, 산출 경로 + 표 + 검증 결과만.
```

---

## 7. [사용자 결정 필요]

1. **종료 시각을 리터럴 `23:59:59` 로 할지, 기존 관례 `23:59:00`(=분 단위 `23:59`)으로 할지.**
   - A안(권고): 기존 관례 유지(`HH:mm`, 초 없이 `23:59`). 실데이터 28+19건이 이미 이 패턴이라 DTO 포맷/백필 변경이 전혀 필요 없고, 노출 판정도 날짜 문자열 비교라 초 단위 차이가 어차피 무의미함.
   - B안: 사용자 원문 그대로 리터럴 `23:59:59` 채택. DTO `@JsonFormat` 패턴을 `HH:mm:ss` 로 바꿔야 하고, 기존 `23:59:00` 데이터와 신규 `23:59:59` 데이터가 섞여 일관성이 깨짐(§4.3 백필 필요해짐).

2. **시작일 `12:00:00` 이 기본값(관리자가 바꿀 수 있음)인지, 강제값(항상 12:00 고정)인지.**
   - A안(권고): 기본값. 단, 현재 FE 는 `type="date"` 뿐이라 실제로 바꿀 UI가 없음 — "기본값" 을 살리려면 향후 시각 override UI(예: 고급 옵션 펼치기)가 필요. 지금 당장은 강제값과 동작이 같지만, 실데이터에 예외(오전 마감 이벤트)가 이미 있었으므로 구조적으로 막지 않는 편을 권고.
   - B안: 강제값. UI 변경 없이 그대로 두고 "이벤트는 항상 정오 시작" 을 룰로 못박음. 오전 이벤트가 필요하면 그때 가서 논의.

3. **기존 데이터 백필(§4.3) 실행 여부.**
   - A안(권고): 미실행. 현재 관례가 이미 정책과 사실상 동일(초 단위 차이만 있고 판정 로직에 영향 없음).
   - B안: 실행. §7-1 에서 B안(리터럴 23:59:59)을 택했을 경우에만 의미 있음 — 데이터 일관성을 위해 §4.3 SQL 로 일괄 보정.

4. **events id=1, id=11 처럼 관례를 벗어난 기존 2개 행을 어떻게 할지.**
   - A안(권고): 그대로 둔다(의도된 값일 가능성 — 특히 id=11 은 오전 10시 마감).
   - B안: 담당자에게 실제 의도를 확인 후 필요 시 수동 정정.
