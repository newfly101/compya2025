# dual-management.md — V1↔V2 페어 컬럼 단위 diff (확정 분석)

> 입력: `docs/map/db-map.md` 의 14개 pair 후보 + Owner 확정 카테고리.
> 각 페어를 1 섹션으로 정리. 컬럼 차이 표(legacy 만 / 신규 만 / 양쪽)와 mapper 사용 위치 cite.
> Owner 확정 카테고리 별 처리 라벨:
>   - **dual-write(의도)** — coupons↔site_coupons
>   - **1:N 정규화** — fun_player_card_positions
>   - **통폐합 계획·배포 legacy** — player_legend* ↔ fun_player_card
>   - **불완전 마이그** — teams↔fun_teams
>   - **이전완료(mapper 0)** — events/notices/boards/posts/tags/posts_tags/users(+user_roles)/quiz_answers
>   - **카드 스탯 페어 (양쪽 살아있음)** — player_card↔fun_player_card 및 그 부속

---

## 1. `coupons` ↔ `site_coupons`  ★ Owner: **의도된 dual-write**

### 컬럼 diff

| 컬럼 | coupons (V1) | site_coupons (V2) | 비고 |
|---|---|---|---|
| `id` | BIGINT PK AUTO_INCREMENT | BIGINT PK AUTO_INCREMENT | 양쪽 |
| `coupon_code` | VARCHAR(100) NOT NULL UNIQUE | VARCHAR(100) NOT NULL UNIQUE | 양쪽 (동일) |
| `title` | VARCHAR(255) NOT NULL | VARCHAR(255) NOT NULL | 양쪽 (동일) |
| `detail` | VARCHAR(500) | VARCHAR(500) | 양쪽 (동일) |
| `expire_at` | DATETIME NOT NULL | DATETIME NOT NULL | 양쪽 (동일) |
| `is_visible` | BOOLEAN DEFAULT true | BOOLEAN DEFAULT true | 양쪽 (동일) |
| `created_at` | TIMESTAMP DEFAULT NOW | TIMESTAMP DEFAULT NOW | 양쪽 |
| `updated_at` | TIMESTAMP DEFAULT NOW ON UPDATE | TIMESTAMP DEFAULT NOW ON UPDATE | 양쪽 |
| `idx_coupons_visible_period` | ✓ (is_visible, expire_at) | ✗ | legacy 만 |
| `idx_coupons_expire_at` | ✓ (expire_at) | ✗ | legacy 만 |

**컬럼 본체 100% 동일**. legacy 만 인덱스 2개 더 보유. 신규에는 인덱스 미정의.

### Mapper 사용 위치 (양쪽 동시 사용 cite)

`mapper/site/coupon/CouponMapper.xml` (namespace: `com.dawne.com2usbaseball.domain.coupon.repository.mapper.CouponMapper`)

| Statement | id | line | 대상 테이블 |
|---|---|---:|---|
| `<select>` | `selectCouponListForUser` | 7–19 | **`site_coupons`** (`FROM site_coupons` line 17) |
| `<select>` | `selectCouponList` | 22–33 | **`site_coupons`** (line 32) |
| `<select>` | `selectCouponById` | 35–47 | **`coupons`** (legacy, line 45) ⚠ 단일 SELECT 만 legacy |
| `<insert>` | `insertCoupon` | 49–67 | **`site_coupons`** (line 50) |
| `<update>` | `updateCouponById` | 69–89 | **`site_coupons`** (line 70) |
| `<update>` | `updateCouponVisible` | 91–97 | **`site_coupons`** (line 92) |

### 분석 결론

- 본 mapper 는 db-map.md 본문 표현("FROM coupons + INSERT INTO site_coupons" 양쪽 동시) 과 **약간 다름**.
- 실제로는 **5/6 statement 가 site_coupons 단독**, **1/6 (`selectCouponById`) 만 legacy `coupons` 참조**.
- INSERT/UPDATE 는 모두 site_coupons 만 → 신규 row 는 site_coupons 단방향 흐름.
- `selectCouponById` 만 legacy 참조 → **단방향 read fallback**(legacy 잔존 row 조회용) 으로 보이며, "양쪽 동시 row 를 INSERT/UPDATE 하는 dual-write" 로는 **DB 단독 분석으로 확인 안 됨**.
- ★ Owner 확정은 "의도된 dual-write 운영" 이지만, mapper 단계에서는 **dual-read(legacy 단건 조회 fallback) + V2-only write** 패턴. service 레이어에서 양쪽 INSERT 를 별도로 호출하는지는 BE-analyzer 가 확인 필요.
- **위험**: 만약 service 레이어가 양쪽에 row 를 동시 INSERT 하지 않는다면, `coupons` 테이블에 신규 row 가 들어갈 경로가 mapper 상에는 없음. selectCouponById 는 영영 빈 결과만 반환할 수 있음 → **runtime 검증 1순위**.

---

## 2. `fun_player_card_positions` ★ Owner: **JSON → 행 정규화 (1:N)**

### 짝 관계

V1 `player_card.positions` (JSON 컬럼, `sql/CREATE_TABLE.sql:441` `JSON NOT NULL`) ↔ V2 `fun_player_card_positions` (정규화 테이블).

### 컬럼 diff (개념적 — 형태가 달라 1:1 컬럼 매칭 불가)

| 컬럼 | player_card (V1, JSON 컬럼) | fun_player_card_positions (V2) | 비고 |
|---|---|---|---|
| (식별) | `player_card.id` (한 행) | `id` BIGINT PK + `card_id` BIGINT FK | 1:N |
| (포지션 목록) | `positions JSON NOT NULL` (배열) | `position_code VARCHAR(10)` (행 1개당 코드 1개) | 형태 변환 |
| (순서) | JSON 배열 인덱스 | `display_order TINYINT DEFAULT 1` | 명시화 |
| (제약) | — | `UNIQUE (card_id, position_code)`, FK→fun_player_card | 정규화 |

**1:1 짝 아님**. V1 한 행의 JSON 배열 → V2 N 행. 컬럼 단위 매칭 불가, 데이터 형태 매칭만 가능.

### Mapper 사용 위치

| 측 | xml | 사용 |
|---|---|---|
| V1 (JSON 컬럼 read/write) | `mapper/player/PlayerCardMapper.xml:32` (`INSERT INTO player_card ... positions ...`) | INSERT 시 JSON 그대로 파라미터 바인딩 |
| V2 (정규화 행) | `mapper/fun/playerCard/PlayerCardPositionsMapper.xml:19,35,44,49,59,69,80` | insert/update/delete/findByCardId |

### 분석 결론

- Owner 확정대로 **방치 상태**. V2 mapper 는 모든 CRUD 가 작성되어 있으나, fun_player_card 와 함께 묶어 호출하는 service 가 있는지는 BE 검증 필요.
- ⚠ **namespace mismatch 발견** (tables.md 참조): xml namespace `domain.fun.playerCard.mapper.PlayerCardPositionsMapper` 와 java 인터페이스 `domain.fun.playerCard.repository.mapper.PlayerCardPositionsMapper` 패키지 경로 다름. MyBatis 가 못 묶을 가능성 → 실제 호출 시 NoStatementException 발생 위험.

---

## 3. `player_legend` ↔ `fun_player_card` (LEGEND 통폐합) ★ Owner: **통폐합 계획, 배포 legacy**

### 연관 테이블 묶음

V1: `player_legend`, `player_legend_hitter_career`, `player_legend_pitcher_career`, `legend_pitcher_pitch_slot` (4개)
V2: `fun_player_card` (LEGEND 카드를 ENUM 으로 흡수) + `fun_player_card_hitter_stats` / `fun_player_card_pitcher_stats` / `fun_player_card_pitcher_pitch_grades`

### 컬럼 diff (player_legend ↔ fun_player_card 핵심부)

| 컬럼 (legacy) | 컬럼 (V2) | 비고 |
|---|---|---|
| `id` BIGINT PK AI | `id` BIGINT PK AI | 양쪽 |
| `card_code` VARCHAR(50) UNIQUE | `card_code` VARCHAR(60) UNIQUE | 양쪽 — V2 가 60자로 확장 |
| `name` VARCHAR(50) NOT NULL UNIQUE | `player_name` VARCHAR(50) NOT NULL | 컬럼 리네임 (`name` → `player_name`), V1 의 UNIQUE 제거 |
| (없음) | `player_id` CHAR(36) NULL | V2 만 — fun_players(미존재) FK 예약 |
| `team_id` BIGINT NOT NULL FK→teams | `team_id` BIGINT NULL FK→fun_teams | 양쪽 — FK 대상이 V1=teams, V2=fun_teams 로 다름 |
| `role` ENUM('HITTER','PITCHER') | `player_role` ENUM('HITTER','PITCHER') | 컬럼 리네임 (`role` → `player_role`) |
| `grade` ENUM('LEGEND') DEFAULT 'LEGEND' | `card_grade` ENUM('LEGEND','EPIC','PLATINUM','MVP','NATIONAL','ALLSTAR','GOLDEN') | 컬럼 리네임 + ENUM 확장 (LEGEND 카드를 일반 카드 시스템에 흡수) |
| `overall` SMALLINT NOT NULL | `overall_rating` SMALLINT NOT NULL | 컬럼 리네임 (`overall` → `overall_rating`) |
| `back_number` SMALLINT | (없음) | legacy 만 |
| `birth_date` DATE | (없음) | legacy 만 |
| `bat_throw` VARCHAR(10) | (없음) | legacy 만 |
| `positions` JSON NOT NULL | (별도 테이블 `fun_player_card_positions`) | 1:N 정규화 (페어 #2 참조) |
| `traits` JSON | (없음) | legacy 만 (V2 미설계) |
| `attributes` JSON NOT NULL | (별도 테이블 `fun_player_card_hitter_stats`/`pitcher_stats`) | 1:1 정규화 |
| (없음) | `season_year` SMALLINT NOT NULL | V2 만 (LEGEND=9999, 일반=1982~현재) |
| `created_at` | `created_at`, `updated_at` | V2 가 updated_at 추가 |

### Career 테이블 (legacy 만 존재)

| 테이블 | V2 짝 | 처리 |
|---|---|---|
| `player_legend_hitter_career` (sql:70) | 없음 | LEGEND 카드 통폐합 시 별도 처리 미결 |
| `player_legend_pitcher_career` (sql:107) | 없음 | 동일 |
| `legend_pitcher_pitch_slot` (sql:141) | `fun_player_card_pitcher_pitch_grades` (10개 구종 컬럼은 동일 — 페어 #6 참조) | V2 키가 `pitcher_name` (player_legend.name) → `card_id` 로 변경 |

### Mapper 사용 위치

| 테이블 | xml | 라인 |
|---|---|---|
| `player_legend` | `mapper/player/PlayerCardMapper.xml:22` | `selectPlayersByPosition` (SELECT) |
| `player_legend_hitter_career` | `mapper/player/PlayerCareer.xml:21` | `selectCareerByHitter` |
| `player_legend_pitcher_career` | `mapper/player/PlayerCareer.xml:37` | `selectCareerByPitcher` |
| `legend_pitcher_pitch_slot` | — | mapper 0건 |
| `fun_player_card` | `mapper/fun/playerCard/PlayerCardMapper.xml:25,50,64,81,98,115` | insert/update/delete/findById/findByCardCode/findAll |

### 분석 결론

- legacy 4개 중 3개는 mapper 보유 → 운영 read 경로 살아있음. 1개 (`legend_pitcher_pitch_slot`) 는 mapper 없음.
- V2 fun_player_card 는 CRUD 풀세트 mapper 보유, 단 namespace mismatch 위험.
- **양쪽 데이터의 single source of truth 결정 미정** (Owner 5번 항목). 어느 쪽이 master 인지 product 의사결정 필요.

---

## 4. `teams` ↔ `fun_teams` ★ Owner: **불완전 마이그레이션**

### 컬럼 diff

| 컬럼 | teams (V1) | fun_teams (V2) | 비고 |
|---|---|---|---|
| `id` BIGINT PK AI | ✓ | ✓ | 양쪽 |
| `team_code` VARCHAR(10) NOT NULL | UNIQUE (`uk_team_code`) | UNIQUE 키가 `(team_code, start_year)` 복합 | V2 가 시즌 차원으로 확장 |
| `team_name` VARCHAR(50) NOT NULL | ✓ | ✓ | 양쪽 |
| `latest_team_id` BIGINT NULL FK→teams | ✓ | ✓ FK→fun_teams | 양쪽, FK 대상 다름 |
| `city` VARCHAR(50) | ✓ | (없음) | legacy 만 |
| `city_name` VARCHAR(50) | (없음) | ✓ | V2 만 (컬럼 리네임 `city` → `city_name`) |
| `start_year` SMALLINT | ✓ | ✓ | 양쪽 |
| `end_year` SMALLINT | ✓ | ✓ | 양쪽 |
| `emblem_url` VARCHAR(255) | ✓ | ✓ | 양쪽 |
| `created_at` | ✓ | ✓ | 양쪽 |
| `updated_at` | (없음) | ✓ ON UPDATE | V2 만 |

### Mapper 사용

| 테이블 | xml | 라인 |
|---|---|---|
| `teams` | `mapper/TeamMapper.xml:12,17` | selectTeamById, selectTeamAll |
| `fun_teams` | — | mapper 0건 |

### 분석 결론

- legacy `teams` 만 mapper 존재 → 운영 read 경로는 V1 단독.
- `fun_teams` 는 스키마만 있고 mapper 0건 + 시드 0건 (`INSERT_DATA_TABLE.sql` 은 `teams` 에만 시드 삽입). **불완전 마이그** 확정.
- ⚠ `fun_player_card.team_id` FK 가 `fun_teams (id)` 로 걸려 있는데 (`sql/V2/fun/CREATE_TABLE_FUN.sql:48`), `fun_teams` 가 비어있다면 fun_player_card insert 가 FK 위반으로 실패하거나 team_id NULL 로만 동작 가능 → runtime 행수 검증 필요.

---

## 5. `player_card` ↔ `fun_player_card` (양쪽 살아있는 카드 메인) — Owner 5번 통폐합 작업의 일부

### 컬럼 diff

| 컬럼 | player_card (V1) | fun_player_card (V2) | 비고 |
|---|---|---|---|
| `id` BIGINT PK AI | ✓ | ✓ | 양쪽 |
| `card_code` VARCHAR(60) UNIQUE | ✓ (V1 도 60자) | ✓ | 양쪽 |
| `name` VARCHAR(50) | ✓ | (rename → `player_name`) | 리네임 |
| (없음) | — | `player_id` CHAR(36) NULL | V2 만 |
| `team_id` BIGINT NOT NULL FK→teams | ✓ | NULL 허용, FK→fun_teams | NULL 허용 + FK 대상 다름 |
| `role` ENUM | ✓ | rename → `player_role` | 리네임 |
| `grade` ENUM(LEGEND/EPIC/PLATINUM/MVP/NATIONAL/ALLSTAR/GOLDEN) | ✓ (V1 도 동일 ENUM) | rename → `card_grade` (동일 ENUM) | 리네임 |
| `season_year` SMALLINT NULL | ✓ (LEGEND 만 NULL) | NOT NULL | V2 가 LEGEND=9999 로 통일 → NULL 제거 |
| `overall` SMALLINT NOT NULL | ✓ | rename → `overall_rating` | 리네임 |
| `back_number` SMALLINT | ✓ | (없음) | legacy 만 |
| `birth_date` DATE | ✓ | (없음) | legacy 만 |
| `bat_throw` VARCHAR(10) | ✓ | (없음) | legacy 만 |
| `positions` JSON NOT NULL | ✓ | (별도 테이블 `fun_player_card_positions`) | 정규화 |
| `traits` JSON | ✓ | (없음) | V2 미설계 |
| `chk_grade_year` | ✓ (LEGEND→year NULL, else NOT NULL) | (없음, season_year=9999 로 해결) | legacy 만 |
| `created_at`, `updated_at` | ✓ | ✓ | 양쪽 |
| 인덱스 | `uk_card_code`, `idx_team_id`, `idx_grade`, `idx_role`, `idx_season_year`, `idx_grade_year` | `uk_*_card_code`, `idx_*_player_id`, `idx_*_team_id`, `idx_*_grade`, `idx_*_role`, `idx_*_grade_year` | V2 가 player_id 인덱스 추가, season_year 단독 인덱스 제거 |

### Mapper

| 테이블 | xml | statement |
|---|---|---|
| `player_card` | `mapper/player/PlayerCardMapper.xml:32` | insertPlayerCard (INSERT 만) |
| `fun_player_card` | `mapper/fun/playerCard/PlayerCardMapper.xml` | insert/update/delete/findById/findByCardCode/findAll |

### 분석 결론

- 양쪽 INSERT 경로 살아있음. SELECT 는 V2 만 풀세트 / V1 은 SELECT 없음.
- ⚠ **V1 PlayerCardMapper 의 `selectPlayersByPosition` (line 22) 은 사실상 `player_legend` 를 SELECT 함**. player_card 에서 SELECT 하는 mapper 구문은 발견되지 않음. 즉 V1 player_card 는 INSERT 만 있고 read 경로가 없음 — runtime 검증 필요.

---

## 6. `player_card_hitter_attributes` ↔ `fun_player_card_hitter_stats` — Owner 5번의 일부

### 컬럼 diff

| 컬럼 | player_card_hitter_attributes (V1) | fun_player_card_hitter_stats (V2) | 비고 |
|---|---|---|---|
| `card_id` BIGINT PK FK | ✓ FK→player_card | ✓ FK→fun_player_card | 양쪽, FK 대상 다름 |
| `accuracy` SMALLINT NOT NULL | ✓ | ✓ | 양쪽 |
| `power` SMALLINT NOT NULL | ✓ | ✓ | 양쪽 |
| **`contact`** SMALLINT NOT NULL '선구' | ✓ | (없음) | legacy 만 |
| (없음) | — | **`discipline`** SMALLINT NOT NULL '선구' | V2 만 (**컬럼 리네임**: `contact` → `discipline`, 의미 동일 "선구") |
| `speed` SMALLINT NOT NULL | ✓ | ✓ | 양쪽 |
| `defense` SMALLINT NOT NULL | ✓ | ✓ | 양쪽 |

### Mapper

| 테이블 | xml | statement |
|---|---|---|
| `player_card_hitter_attributes` | `mapper/player/PlayerCardMapper.xml:64` | insertHitterAttribute (INSERT 만) |
| `fun_player_card_hitter_stats` | `mapper/fun/playerCard/PlayerCardHitterStatsMapper.xml:20,42,53,65` | insert/update/delete/findByCardId |

### ⚠ 의미 변경 검증 포인트

- `contact` → `discipline` 리네임. 코멘트는 양쪽 모두 "선구". 의미 동일 의도지만 **영어 단어 의미가 다름**:
  - `contact` = 콘택트 (방망이 맞추는 능력, MLB The Show 등에서 사용)
  - `discipline` = 선구안 (볼 골라내기, OBP 관련)
- 두 개념은 **야구 스탯에서 명백히 다른 능력치**. 컬럼 리네임이 단순 영문 표기 정정인지, 의미 변경인지 검증 필요. **Owner 의사결정 1순위**.

---

## 7. `player_card_pitcher_attributes` ↔ `fun_player_card_pitcher_stats` — Owner 5번의 일부

### 컬럼 diff

| 컬럼 | V1 | V2 | 비고 |
|---|---|---|---|
| `card_id` PK FK | ✓ | ✓ | 양쪽, FK 대상 다름 |
| `control` | ✓ | ✓ | 양쪽 |
| `velocity` | ✓ | ✓ | 양쪽 |
| `stamina` | ✓ | ✓ | 양쪽 |
| `fastball` | ✓ | ✓ | 양쪽 |
| `breaking` | ✓ | ✓ | 양쪽 |

**100% 동일.** 차이 없음.

### Mapper

| 테이블 | xml | statement |
|---|---|---|
| `player_card_pitcher_attributes` | `mapper/player/PlayerCardMapper.xml:84` | insertPitcherAttribute (INSERT 만) |
| `fun_player_card_pitcher_stats` | `mapper/fun/playerCard/PlayerCardPitcherStatsMapper.xml:20,42,53,65` | insert/update/delete/findByCardId |

---

## 8. `legend_pitcher_pitch_slot` ↔ `fun_player_card_pitcher_pitch_grades` — Owner 5번의 일부

### 컬럼 diff

| 컬럼 | legend_pitcher_pitch_slot (V1) | fun_player_card_pitcher_pitch_grades (V2) | 비고 |
|---|---|---|---|
| (식별) | `id` BIGINT PK AI + `pitcher_name` VARCHAR(50) UNIQUE FK→player_legend.name | `card_id` BIGINT PK FK→fun_player_card.id | 키 구조 변경: 선수명 → 카드 ID |
| `four_seam` CHAR(1) | ✓ | rename → `four_seam_grade` VARCHAR(2) | 리네임 + 타입 확장 |
| `two_seam` | ✓ | `two_seam_grade` VARCHAR(2) | 동일 |
| `change_up` | ✓ | `changeup_grade` VARCHAR(2) | 리네임 (언더스코어 제거) |
| `circle_change` | ✓ | `circle_changeup_grade` VARCHAR(2) | 리네임 |
| `slider` | ✓ | `slider_grade` | 동일 |
| `curve` | ✓ | `curve_grade` | 동일 |
| `fork` | ✓ | `forkball_grade` | 리네임 (`fork` → `forkball`) |
| `cutter` | ✓ | `cutter_grade` | 동일 |
| `sinker` | ✓ | `sinker_grade` | 동일 |
| `splitter` | ✓ | `splitter_grade` | 동일 |
| `chk_pitch CHECK (... IN ('C','B','A','S') ...)` | ✓ | ✗ | legacy 만 (V2 에서 제거) |

10개 구종 컬럼 모두 `_grade` 접미사 추가, 타입 CHAR(1) → VARCHAR(2) 확장 (V2 가 CHECK 제약 제거 후 'SS' 같은 2자 등급 표현 가능성 열어둠).

### Mapper

| 테이블 | xml | statement |
|---|---|---|
| `legend_pitcher_pitch_slot` | — | **mapper 0건** |
| `fun_player_card_pitcher_pitch_grades` | `mapper/fun/playerCard/PlayerCardPitcherPitchGradesMapper.xml:25,57,73,90` | insert/update/delete/findByCardId |

### 분석 결론

- **레전드 특화 → 카드 일반화**: 키가 pitcher_name 에서 card_id 로 바뀌어, 일반 카드(NATIONAL, EPIC 등)에도 구종 등급 부여 가능.
- legacy mapper 0건이라 V1 데이터는 시드 (`INSERT_DATA_TABLE.sql`) 로만 채워진 read-only 마스터 데이터일 가능성. runtime 행수 검증 필요.

---

## 9. `events` ↔ `site_events` — **이전완료(legacy mapper 0)**

### 컬럼 diff

| 컬럼 | events (V1) | site_events (V2) | 비고 |
|---|---|---|---|
| `id` BIGINT PK AI | ✓ | ✓ | 양쪽 |
| `event_type` ENUM('OFFICIAL','INTERNAL') DEFAULT 'OFFICIAL' | ✓ | ✓ | 양쪽 |
| `title` VARCHAR(255) | ✓ | ✓ | 양쪽 |
| `start_at` DATETIME | ✓ | ✓ | 양쪽 |
| `expire_at` DATETIME | ✓ | ✓ | 양쪽 |
| `image_url` VARCHAR(500) | ✓ | ✓ | 양쪽 |
| `external_link` VARCHAR(500) | ✓ | ✓ | 양쪽 |
| `is_visible` BOOLEAN | ✓ | ✓ | 양쪽 |
| `created_at`/`updated_at` | TIMESTAMP | DATETIME (NOT NULL) | 타입만 미세 차이 |
| CHECK expire>start | ✓ | ✓ (chk_site_events_expire_after_start) | 양쪽 |
| `idx_*_visible_period` | ✓ | ✓ | 양쪽 |

**완전 동일** (타입 TIMESTAMP↔DATETIME 만 다름).

### Mapper

| 테이블 | xml |
|---|---|
| `events` | — |
| `site_events` | `mapper/site/event/EventMapper.xml:21,40,56,61,86,115` |

### 결론
이전 완료. 풀세트 V2 mapper 만 존재.

---

## 10. `notices` ↔ `site_notices` — **이전완료**

### 컬럼 diff

| 컬럼 | notices (V1) | site_notices (V2) | 비고 |
|---|---|---|---|
| `id` BIGINT PK AI | ✓ | ✓ | 양쪽 |
| `source` ENUM('INTERNAL','EXTERNAL') | ✓ | ✓ | 양쪽 |
| `title` VARCHAR(255) | ✓ | ✓ | 양쪽 |
| `summary` TEXT | ✓ | ✓ | 양쪽 |
| `content` LONGTEXT | ✓ | ✓ | 양쪽 |
| `external_url` VARCHAR(500) | ✓ | ✓ | 양쪽 |
| `image_url` VARCHAR(500) | (없음) | ✓ | V2 만 |
| `is_visible` BOOLEAN | ✓ | ✓ | 양쪽 |
| `is_pinned` BOOLEAN | ✓ | ✓ | 양쪽 |
| `published_at` DATETIME | (없음) | ✓ | V2 만 |
| `created_at`/`updated_at` | ✓ | ✓ | 양쪽 |
| CHECK source-payload | ✓ | ✓ | 양쪽 (동일 식) |
| 인덱스 | (없음) | `idx_*_visible_pinned_created`, `idx_*_source`, `idx_*_published_at` | V2 만 (V2 가 superset) |

### Mapper

| 테이블 | xml |
|---|---|
| `notices` | — |
| `site_notices` | `mapper/site/notice/NoticeMapper.xml:26,48,71,92,111,119,144,159,166,173` |

### 결론
이전 완료. V2 가 image_url + published_at + 인덱스 3개 추가된 superset.

---

## 11. `boards` ↔ `site_board` — **이전완료**

### 컬럼 diff

| 컬럼 | boards (V1) | site_board (V2) | 비고 |
|---|---|---|---|
| `id` BIGINT PK AI | ✓ | ✓ | 양쪽 |
| `code` VARCHAR(50) UNIQUE | ✓ | ✓ | 양쪽 |
| `name` VARCHAR(100) | ✓ | ✓ | 양쪽 |
| `description` VARCHAR(255) | ✓ | ✓ | 양쪽 |
| `write_role` ENUM('ADMIN','USER') | ✓ | ✓ | 양쪽 |
| `read_role` ENUM('ALL','LOGIN') | ✓ | ✓ | 양쪽 |
| `use_comment` BOOLEAN | (없음) | ✓ | V2 만 |
| `use_like` BOOLEAN | (없음) | ✓ | V2 만 |
| `use_tag` BOOLEAN | (없음) | ✓ | V2 만 |
| `is_visible` BOOLEAN | ✓ | ✓ | 양쪽 |
| `is_deleted` BOOLEAN | ✓ | ✓ | 양쪽 |
| `sort_order` INT | ✓ | ✓ | 양쪽 (V2 NOT NULL 명시) |
| `created_at`/`updated_at` | TIMESTAMP | DATETIME NOT NULL | 타입 미세 차이 |
| `idx_board_list` | (없음) | ✓ | V2 만 |

### Mapper

| 테이블 | xml |
|---|---|
| `boards` | — |
| `site_board` | `mapper/site/community/BoardMapper.xml` |

### 결론
이전 완료. V2 가 use_* 3개 + 인덱스 추가.

---

## 12. `posts` ↔ `site_post` — **이전완료**

### 컬럼 diff

| 컬럼 | posts (V1) | site_post (V2) | 비고 |
|---|---|---|---|
| `id` BIGINT PK AI | ✓ | ✓ | 양쪽 |
| `board_id` BIGINT NOT NULL FK | ✓ FK→boards | ✓ FK→site_board | 양쪽, FK 대상 다름 |
| `author_type` ENUM('ADMIN','USER') | ✓ | ✓ | 양쪽 |
| `author_id` BIGINT NULL | ✓ | ✓ | 양쪽 |
| `author_name` VARCHAR(50) | ✓ | ✓ | 양쪽 |
| `title` VARCHAR(255) | ✓ | ✓ | 양쪽 |
| `content` LONGTEXT NULL | ✓ | ✓ | 양쪽 |
| `link_type` ENUM('INTERNAL','EXTERNAL') | ✓ | ✓ | 양쪽 |
| `external_url` VARCHAR(500) | ✓ | ✓ | 양쪽 |
| `is_pinned` BOOLEAN | ✓ | ✓ | 양쪽 |
| `is_visible` BOOLEAN | ✓ | ✓ | 양쪽 |
| `is_deleted` BOOLEAN | (없음) | ✓ | V2 만 |
| `view_count` INT | ✓ | ✓ | 양쪽 |
| `comment_count` INT | (없음) | ✓ | V2 만 |
| `like_count` INT | (없음) | ✓ | V2 만 |
| `dislike_count` INT | (없음) | ✓ | V2 만 |
| `report_count` INT | (없음) | ✓ | V2 만 |
| 인덱스 | `idx_board_visible_created`, `idx_board_pinned_created`, `idx_author` | `idx_post_list`, `idx_post_popular`, `idx_post_author`, `idx_post_report` | V2 가 4개로 재구성 |

### Mapper

| 테이블 | xml |
|---|---|
| `posts` | — |
| `site_post` | `mapper/site/community/PostMapper.xml` |

### 결론
이전 완료. V2 는 like/dislike/report counter denormalize + soft-delete 컬럼 추가.

---

## 13. `tags` ↔ `site_tag` — **이전완료** (단/복수 네이밍)

### 컬럼 diff

| 컬럼 | tags (V1) | site_tag (V2) | 비고 |
|---|---|---|---|
| `id` BIGINT PK AI | ✓ | ✓ | 양쪽 |
| `code` VARCHAR(50) UNIQUE | ✓ | ✓ | 양쪽 |
| `name` VARCHAR(50) | ✓ | ✓ | 양쪽 |
| `description` VARCHAR(255) | ✓ | ✓ | 양쪽 |
| `is_visible` BOOLEAN | ✓ | ✓ | 양쪽 |
| `is_deleted` BOOLEAN | ✓ | ✓ | 양쪽 |
| `created_at`/`updated_at` | TIMESTAMP | DATETIME NOT NULL | 타입 미세 차이 |

**컬럼 100% 동일.** 단/복수 네이밍 차이만.

### Mapper

| 테이블 | xml |
|---|---|
| `tags` | — |
| `site_tag` | `mapper/site/community/TagMapper.xml` |

---

## 14. `posts_tags` ↔ `site_post_tag` — **이전완료** (단/복수)

### 컬럼 diff

| 컬럼 | posts_tags (V1) | site_post_tag (V2) | 비고 |
|---|---|---|---|
| `(post_id, tag_id)` PK | ✓ | ✓ | 양쪽 |
| FK | post_id→posts.id, tag_id→tags.id | post_id→site_post.id, tag_id→site_tag.id | FK 대상 다름 |
| `idx_post_tag_by_tag` | (없음) | ✓ | V2 만 |

**컬럼 동일.**

### Mapper

| 테이블 | xml |
|---|---|
| `posts_tags` | — |
| `site_post_tag` | `mapper/site/community/PostTagMapper.xml` |

---

## 15. `users` (+`user_roles`) ↔ `site_users` — **이전완료, 흡수 통합**

### 컬럼 diff

| 컬럼 | users (V1) | user_roles (V1) | site_users (V2) | 비고 |
|---|---|---|---|---|
| `id` BIGINT PK AI | ✓ | (PK는 user_id) | ✓ | V2 단일 PK |
| `provider` VARCHAR(20) | ✓ | — | rename → `oauth_provider` | 리네임 |
| `provider_id` VARCHAR(100) | ✓ | — | rename → `oauth_provider_id` | 리네임 |
| `oauth_nickname` VARCHAR(20) | ✓ | — | ✓ | 동일 |
| `oauth_email` VARCHAR(255) | ✓ | — | ✓ | 동일 |
| `oauth_profile_image` VARCHAR(500) | ✓ | — | ✓ | 동일 |
| `oauth_age_range` VARCHAR(10) | ✓ | — | ✓ | 동일 |
| `nickname` VARCHAR(20) | ✓ | — | rename → `service_nickname` | 리네임 |
| `created_at` | ✓ | ✓ (별도) | ✓ | V2 통합 |
| `last_login_at` | ✓ | — | ✓ | 동일 |
| `updated_at` | (없음) | ✓ | ✓ | V2 추가 |
| `role` ENUM('ADMIN','USER') | — | ✓ DEFAULT 'USER' | rename → `user_role` | user_roles → site_users 흡수 |
| `status` ENUM('ACTIVE','BLOCKED','WITHDRAWN','SUSPENDED') | — | ✓ DEFAULT 'ACTIVE' | rename → `user_status` | 흡수 |
| `ban_reason` VARCHAR(255) | — | ✓ | (없음) | V2 에서 제거 |
| `uk_provider`/`uk_oauth` | UNIQUE(provider,provider_id) | — | UNIQUE(oauth_provider,oauth_provider_id) | 양쪽 |

V2 가 `users + user_roles` 두 테이블을 한 테이블로 흡수 (별도 user_id PK 의 user_roles 1:1 join 제거). `ban_reason` 컬럼 손실.

### Mapper

| 테이블 | xml |
|---|---|
| `users` | — |
| `user_roles` | — |
| `site_users` | `mapper/UserMapper.xml:25,33,62,85` |

### 결론
이전 완료. ⚠ `ban_reason` 데이터가 V2 site_users 에 컬럼이 없어 마이그시 손실. 운영 데이터 잔존 시 별도 검증 필요.

---

## 16. `quiz_answers` ↔ `fun_quiz` — **이전완료**

### 컬럼 diff

| 컬럼 | quiz_answers (V1) | fun_quiz (V2) | 비고 |
|---|---|---|---|
| `id` BIGINT PK AI | ✓ | ✓ | 양쪽 |
| `round` INT NOT NULL | ✓ | ✓ | 양쪽 |
| `title` VARCHAR(100) NOT NULL | ✓ | (없음) | legacy 만 (V2 가 title 제거) |
| `image_url` VARCHAR(500) NOT NULL | ✓ | ✓ | 양쪽 |
| `is_visible` BOOLEAN | ✓ | ✓ | 양쪽 |
| `created_at`/`updated_at` | DATETIME NOT NULL | DATETIME NOT NULL DEFAULT NOW | 동일 |
| `uq_round` | ✓ | ✓ | 양쪽 |

### Mapper

| 테이블 | xml |
|---|---|
| `quiz_answers` | — |
| `fun_quiz` | `mapper/fun/quiz/QuizMapper.xml:15,29,41,46,51,61` |

### 결론
이전 완료. ⚠ `title` 컬럼이 V2 에 없음. 마이그시 데이터 손실 또는 frontend 표시 변경 필요.

---

## 종합 검증 요청 (runtime-analyzer 우선 확인)

| 페어 | 운영 row 수 검증 핵심 | 우선순위 |
|---|---|---|
| `coupons` ↔ `site_coupons` | 양쪽 row 수 동기화 여부, `coupons.id` 기반 selectCouponById 가 실제 빈 결과인지 | ★★★ |
| `teams` ↔ `fun_teams` | `fun_teams` row 수 (0이면 fun_player_card insert FK 실패 위험) | ★★★ |
| `player_card` ↔ `fun_player_card` | 양쪽 INSERT 모두 호출되는지, single source of truth 결정 | ★★ |
| `player_legend*` (4개) | 운영 read 만 / 양쪽 INSERT 호출 / fun_player_card 단방향 INSERT 여부 | ★★ |
| `legend_pitcher_pitch_slot` | mapper 0건 — 시드 row 만 있는지 | ★★ |
| `skill_pitcher_grade_stat` | mapper 0건 — 시드 row 만 있는지 | ★ |
| `kbo_*` 6개 | row 수 (0 추정 — Owner 진술 일치 검증) | ★ |
| `coach`, `coach_skill_*` | mapper 발견됨 — service 호출 여부 / 컨트롤러 노출 여부 | ★★ |
| `contact↔discipline` 의미 변경 | 데이터 분포 동일성 (단순 리네임 vs 능력치 재정의) | ★★★ |
