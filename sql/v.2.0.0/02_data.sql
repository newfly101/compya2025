-- =====================================================================
-- data_ 테이블 DDL — 게임 데이터 (레전드·카드·히스토리모드·스킬)
-- 실행 순서: 이 파일 안에서 위→아래. data_player_legend 가 data_pitch_type 을
--   먼저 선언해야 해서 카드보다 앞에 온다 — data_player_legend_material.player_card_id
--   FK(fk_dplm_card)는 data_player_card 생성 이후인 파일 끝에서 건다.
-- 포함 테이블(행수는 sql-folder-map.md 2026-09-13 실측 기준, data_player_card 는
--   database-notes.md 2026-09-28 기준으로 대체 — 이후 갱신 있을 수 있음):
--   data_history_round(70) · data_history_roster(1750, FK→round) ·
--   data_player_legend(74) · data_player_legend_material(592, FK→legend) ·
--   data_player_legend_stat(74, FK→legend) · data_pitch_type(10, 마스터) ·
--   data_player_legend_pitch(132, FK→legend,pitch_type) ·
--   data_player_card(11668) · data_player_card_stat(12412, FK→card) ·
--   data_player_card_pitch(21007, FK→card,pitch_type) ·
--   data_player_skill(92) · data_player_skill_tier(540, FK→skill) ·
--   data_player_skill_tier_value(877, FK→tier)
-- 출처: sql/V3/CREATE_01~04_*.sql
-- =====================================================================

-- =====================================================================
-- 히스토리 모드 스키마 (MariaDB 10.2.1+ : CHECK)
--
--   data_history_round    라운드 70개 (14일차 x 5)
--   data_history_roster   로스터 1,750행 (라운드당 25명)
--
-- "스테이지" 는 게임 내 다른 모드 이름과 겹쳐 쓰지 않는다.
--
-- 레전드 메타(구단·포지션·타입)는 만들지 않는다 — data_player_legend 가
-- 이미 갖고 있어 두 벌이 되면 어긋난다. 조인해서 쓴다.
--
-- 카드 표기 "이만수'82" 는 이름과 연도로 쪼개 저장한다. 붙여 두면
-- data_player_legend_material 과 조인할 수 없다. 표시용 문자열은 화면이 조립한다.
--
-- 주차·요일도 저장하지 않는다. day_no 에서 나온다 (주차 = ⌈day_no/7⌉).
--
-- id 는 애플리케이션 생성 UUID v4.
-- =====================================================================

USE compyafun;

-- FK 호환 확인 — 부모 data_player_legend.id 와 COLUMN_TYPE / COLLATION_NAME 이 같아야 한다
-- SELECT COLUMN_TYPE, COLLATION_NAME FROM information_schema.COLUMNS
--  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'data_player_legend' AND COLUMN_NAME = 'id';

-- DROP TABLE IF EXISTS data_history_roster;
-- DROP TABLE IF EXISTS data_history_round;

-- ─────────────────────────────────────────────────────────────────────
-- 라운드
-- round_label 은 게임 표기 그대로 둔다 ("82 KBO 원년", "KBO 용병" 처럼
-- 구단이 아닌 것도 있어 team_code 로 정규화할 수 없다).
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_history_round
(
    id          CHAR(36)         NOT NULL COMMENT '식별자 (UUID v4)',
    day_no      TINYINT UNSIGNED NOT NULL COMMENT '일차 1~14',
    round_no    TINYINT UNSIGNED NOT NULL COMMENT '일차 내 라운드 1~5',
    round_label VARCHAR(30)      NOT NULL COMMENT '게임 표기 그대로 (82 KBO 원년, KBO 용병 …)',

    created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    UNIQUE KEY uk_dhr_day_round (day_no, round_no),

    CONSTRAINT chk_dhr_day CHECK (day_no BETWEEN 1 AND 14),
    CONSTRAINT chk_dhr_round CHECK (round_no BETWEEN 1 AND 5)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '히스토리 모드 라운드';

-- ─────────────────────────────────────────────────────────────────────
-- 로스터
--
-- 재료 여부는 담지 않는다. 한 카드(선수+연도)가 두 레전드의 재료가 되는 일은
-- 게임 규칙상 없어서, data_player_legend_material 과 조인하면 정확히 나온다.
-- 여기에 legend_id 를 또 두면 재료 구성이 바뀔 때 두 곳을 맞춰야 한다.
--
-- 재료 판정은 카드 단위다. 로스터에 나온 (선수명, 연도)가 재료 마스터에 있으면
-- 전부 재료로 표기한다 — 게임이 L 마크를 빠뜨린 자리가 있어(D7-1 송진우'06 등)
-- 마크가 아니라 재료 마스터를 기준으로 삼는다. 그래서 엑셀의 O 175건보다 많다.
--
-- ENUM 선언 순서 = 게임 화면 그룹 노출 순서.
-- 화면 순서 재현은 ORDER BY roster_group, order_no 다 (그룹만으로는 안쪽 순서가 안 잡힌다).
--
-- CHECK 는 "그 구분이 가질 수 있는 슬롯 범위"만 제한하고, UNIQUE 가 같은 슬롯 중복을 막는다.
-- 둘을 합쳐도 한 라운드의 최대 행이 9+5+5+5+1=25 로 제한될 뿐,
-- 정원을 채웠는지(미달)는 보장하지 못한다 — 행 단위 CHECK 는 다른 행을 세지 못한다.
-- 25인 구성 여부는 적재 후 아래 검증 쿼리로 확인한다.
--
-- position_code 는 조사 전이라 비워 둔다. NOT NULL 로 바꾸지 않는 게 낫다 —
-- 새 라운드가 추가될 때 조사 전 데이터를 넣을 수 없게 된다. 화면은 '-' 로 표시한다.
-- 같은 카드가 여러 라운드에 나오는 경우가 16종 있어(나바로'14 등), 카드 마스터를
-- 신설할 때는 이 컬럼을 그쪽으로 옮겨야 한 벌로 관리된다.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_history_roster
(
    id            CHAR(36)         NOT NULL COMMENT '식별자 (UUID v4)',
    round_id      CHAR(36)         NOT NULL COMMENT 'data_history_round.id',

    roster_group  ENUM ('STARTING_HITTER','BENCH_HITTER',
                        'STARTING_PITCHER','RELIEF_PITCHER','CLOSER')
                                   NOT NULL COMMENT '선발타자9/후보타자5/선발투수5/중간계투5/마무리1',
    order_no      TINYINT UNSIGNED NOT NULL COMMENT '구분 내 표시 순서',

    player_name   VARCHAR(50)      NOT NULL COMMENT '동명이인 접미(S/B/C) 포함. 연도 제외',
    season_year   SMALLINT         NOT NULL COMMENT '카드 연도 (표기 "82" → 1982)',

    position_code VARCHAR(10)      NULL COMMENT '카드 포지션. 조사 전이라 NULL',

    created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    UNIQUE KEY uk_dhro_slot (round_id, roster_group, order_no),
    -- 재료 마스터와 잇는 유일한 키. 재료 판정과 배지가 이 인덱스를 탄다
    INDEX idx_dhro_card (player_name, season_year),

    CONSTRAINT fk_dhro_round FOREIGN KEY (round_id)
        REFERENCES data_history_round (id) ON DELETE CASCADE,

    CONSTRAINT chk_dhro_order CHECK (
        (roster_group = 'STARTING_HITTER' AND order_no BETWEEN 1 AND 9)
            OR (roster_group = 'BENCH_HITTER' AND order_no BETWEEN 1 AND 5)
            OR (roster_group = 'STARTING_PITCHER' AND order_no BETWEEN 1 AND 5)
            OR (roster_group = 'RELIEF_PITCHER' AND order_no BETWEEN 1 AND 5)
            OR (roster_group = 'CLOSER' AND order_no = 1)
        ),
    CONSTRAINT chk_dhro_year CHECK (season_year BETWEEN 1982 AND 2100)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '히스토리 모드 25인 로스터';

-- ─────────────────────────────────────────────────────────────────────
-- 적재 후 확인
-- ─────────────────────────────────────────────────────────────────────
-- SELECT COUNT(*) FROM data_history_round;                              -- 70
-- SELECT COUNT(*) FROM data_history_roster;                             -- 1750
-- 재료 카드 수 — 조인으로 센다 (176)
-- SELECT COUNT(*) FROM data_history_roster r
--          JOIN data_player_legend_material m
--               ON m.player_name = r.player_name AND m.season_year = r.season_year
-- WHERE m.material_type = 'PLAYER';

-- 라운드별 25인 구성 검증 (0행이어야 정상)
-- 그룹이 통째로 비면 GROUP BY 결과에서 빠져 버리므로, 라운드를 기준으로 두고 조건 집계한다.
-- SELECT d.day_no, d.round_no, COUNT(r.id) AS total,
--        SUM(r.roster_group = 'STARTING_HITTER')  AS starting_hitter,
--        SUM(r.roster_group = 'BENCH_HITTER')     AS bench_hitter,
--        SUM(r.roster_group = 'STARTING_PITCHER') AS starting_pitcher,
--        SUM(r.roster_group = 'RELIEF_PITCHER')   AS relief_pitcher,
--        SUM(r.roster_group = 'CLOSER')           AS closer
-- FROM data_history_round d
--          LEFT JOIN data_history_roster r ON r.round_id = d.id
-- GROUP BY d.id, d.day_no, d.round_no
-- HAVING total <> 25 OR starting_hitter <> 9 OR bench_hitter <> 5
--     OR starting_pitcher <> 5 OR relief_pitcher <> 5 OR closer <> 1;

-- 한 카드가 두 레전드의 재료로 잡히는지 (0행이어야 정상)
-- 이 전제가 깨지면 조인만으로 재료 판정을 할 수 없게 되므로 적재 후 한 번 본다.
-- SELECT player_name, season_year, COUNT(DISTINCT legend_id) c
-- FROM data_player_legend_material WHERE material_type = 'PLAYER'
-- GROUP BY 1, 2 HAVING c > 1;

-- 배지 — 이 레전드의 재료가 히스토리 모드 어디서 나오는가
-- SELECT m.player_name, m.season_year, d.day_no, d.round_no, d.round_label
-- FROM data_player_legend_material m
-- JOIN data_history_roster r ON r.player_name = m.player_name AND r.season_year = m.season_year
-- JOIN data_history_round d ON d.id = r.round_id
-- WHERE m.legend_id = ? AND m.material_type = 'PLAYER'
-- ORDER BY d.day_no, d.round_no;

-- 라운드 목록 응답 — 재료 여부(대상 레전드)를 조인으로 붙인다
-- SELECT d.day_no, d.round_no, d.round_label, r.roster_group, r.order_no,
--        r.player_name, r.season_year, l.legend_name
-- FROM data_history_round d
--          JOIN data_history_roster r ON r.round_id = d.id
--          LEFT JOIN data_player_legend_material m
--                    ON m.player_name = r.player_name AND m.season_year = r.season_year
--                   AND m.material_type = 'PLAYER'
--          LEFT JOIN data_player_legend l ON l.id = m.legend_id
-- ORDER BY d.day_no, d.round_no, r.roster_group, r.order_no;

-- =====================================================================
-- 레전드 재료 스키마
--
-- 레전드는 카드 등급(fun_player_card.card_grade = 'LEGEND')이고,
-- 이 두 테이블은 "레전드 1장을 내리는 데 필요한 재료 조합"을 담는다.
--
--   data_player_legend           레전드 마스터 (74명)
--   data_player_legend_material  재료 (레전드당 선수 6행 + 코치 2행 = 8행)
--
-- 재료는 두 형태를 한 테이블에 담는다.
--   PLAYER  선수 카드 1장    → 이름 + 구단 + 연도 (+ 포지션, 카드ID)
--   COACH   코치 세트 1묶음  → 구단 + 연도       (세트 장수는 항상 6)
--
-- id 는 UUID v4 (애플리케이션 생성). MariaDB UUID() 는 v1 이므로 사용하지 않는다.
-- =====================================================================

USE compyafun;

-- DROP TABLE IF EXISTS data_player_legend_material;
-- DROP TABLE IF EXISTS data_player_legend;

-- ─────────────────────────────────────────────────────────────────────
-- 레전드 마스터
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_legend
(
    id            CHAR(36)    NOT NULL COMMENT '레전드 식별자 (UUID v4)',
    legend_name   VARCHAR(50) NOT NULL COMMENT '레전드 카드명. 동명이인 접미사 포함 (예: 김재현S)',
    legend_type   ENUM ('NORMAL','NEW','LIVING','NATIONAL')
                              NOT NULL COMMENT '레전드 계열 (일반 / 신규 / LIVING / 국가대표)',
    team_code     VARCHAR(10) NOT NULL COMMENT '레전드 구단 코드 (fun_teams.team_code)',
    player_role   ENUM ('HITTER','PITCHER')
                              NOT NULL COMMENT '타자 / 투수',
    position_code VARCHAR(10) NULL COMMENT '레전드 포지션 코드 (SP, 3B, C/DH 등)',

    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    UNIQUE KEY uk_dpl_name (legend_name),
    INDEX idx_dpl_type (legend_type),
    INDEX idx_dpl_team (team_code)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '레전드 마스터 - 재료 조합의 결과물';

-- ─────────────────────────────────────────────────────────────────────
-- 레전드 재료
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_legend_material
(
    id                   CHAR(36)    NOT NULL COMMENT '재료 식별자 (UUID v4)',
    legend_id            CHAR(36)    NOT NULL COMMENT 'data_player_legend.id',
    material_type        ENUM ('PLAYER','COACH')
                                     NOT NULL COMMENT '선수 카드 1장 / 코치 세트 1묶음(6장)',
    slot_no              TINYINT     NOT NULL COMMENT '표시 순서 (PLAYER 1~6, COACH 1~2)',

    -- 공통 (PLAYER: 카드 표기 기준 / COACH: 세트 기준)
    team_code            VARCHAR(10) NOT NULL COMMENT '구단 코드 (fun_teams.team_code). 카드에 적힌 그 시절 구단명',
    season_year          SMALLINT    NOT NULL COMMENT '연도',

    -- PLAYER 전용
    player_name          VARCHAR(50) NULL COMMENT 'PLAYER 필수 / COACH NULL. 연도 접미사 제외, 동명이인 접미사(B/S/C)는 유지',
    player_position_code VARCHAR(10) NULL COMMENT '포지션 코드 (fun_player_card_positions.position_code 동일 도메인). 미조사',
    player_card_id       CHAR(36)    NULL COMMENT 'data_player_card.id. PLAYER 행만 채워진다 (연결 UPDATE: sql/V2/UPDATE_material_card_id_link.sql)',

    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    UNIQUE KEY uk_dplm_slot (legend_id, material_type, slot_no),
    INDEX idx_dplm_player (player_name, season_year),
    INDEX idx_dplm_card (player_card_id),
    INDEX idx_dplm_team_year (team_code, season_year),

    CONSTRAINT fk_dplm_legend FOREIGN KEY (legend_id)
        REFERENCES data_player_legend (id) ON DELETE CASCADE,

    -- 타입별 필수/금지 값 강제. COACH 행에 선수 전용 컬럼이 새어 들어가는 것을 막는다.
    CONSTRAINT chk_dplm_shape CHECK (
        (material_type = 'PLAYER' AND player_name IS NOT NULL)
            OR
        (material_type = 'COACH' AND player_name IS NULL
                                 AND player_position_code IS NULL
                                 AND player_card_id IS NULL)
        )

    -- player_card_id FK(fk_dplm_card) 는 sql/V3/CREATE_03_data_player_card.sql 끝에서 건다
    -- (data_player_card 가 이 파일보다 나중에 생성되므로 여기서는 걸 수 없다)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '레전드 재료 - 선수 카드 6장 + 코치 세트 2묶음';

-- ── 원본: data_player_legend_stat.sql (병합 — 2026-09-13 재편) ──
-- =====================================================================
-- 레전드 스탯 스키마 (MariaDB 10.2.1+ : CHECK / STORED 생성 컬럼)
--
--   data_player_legend_stat    태생 5스탯 + OVR + 평점  (레전드 1:1)
--   data_pitch_type            구종 코드 10종            (마스터)
--   data_player_legend_pitch   투수 보유 구종 + 등급     (1:N)
--
-- 스탯은 stat1~stat5 중립 슬롯으로 둔다. 추후 카드 등급별 스탯을 같은
-- 슬롯 구조로 만들어 하나로 통합·이관하기 위함이다.
-- 화면 라벨은 애플리케이션(PlayerStatLabel)이 player_role 로 결정한다.
--
-- id 는 애플리케이션 생성 UUID v4. MariaDB UUID() 는 v1 이라 쓰지 않는다.
-- =====================================================================

USE compyafun;

-- FK 호환 확인 — 부모 data_player_legend.id 와 COLUMN_TYPE / COLLATION_NAME 이 같아야 한다
-- SELECT COLUMN_TYPE, COLLATION_NAME FROM information_schema.COLUMNS
--  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'data_player_legend' AND COLUMN_NAME = 'id';

-- DROP TABLE IF EXISTS data_player_legend_pitch;
-- DROP TABLE IF EXISTS data_pitch_type;
-- DROP TABLE IF EXISTS data_player_legend_stat;

-- ─────────────────────────────────────────────────────────────────────
-- 레전드 태생 스탯
--
--   HITTER  stat1 정확 / stat2 파워 / stat3 선구 / stat4 주력 / stat5 수비
--   PITCHER stat1 제구 / stat2 구위 / stat3 체력 / stat4 직구 / stat5 변화
--
-- 평점 이력은 남기지 않는다. 갱신되면 rating 을 UPDATE 하고 rating_rev 를
-- 새 판본으로 바꾼다. 판본별 히스토리가 필요해지면 1:N 으로 분리한다.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_legend_stat
(
    legend_id  CHAR(36)         NOT NULL COMMENT 'data_player_legend.id',

    stat1      TINYINT UNSIGNED NOT NULL COMMENT '타자 정확 / 투수 제구',
    stat2      TINYINT UNSIGNED NOT NULL COMMENT '타자 파워 / 투수 구위',
    stat3      TINYINT UNSIGNED NOT NULL COMMENT '타자 선구 / 투수 체력',
    stat4      TINYINT UNSIGNED NOT NULL COMMENT '타자 주력 / 투수 직구',
    stat5      TINYINT UNSIGNED NOT NULL COMMENT '타자 수비 / 투수 변화',

    -- 기본 정렬 키. 애플리케이션에서 계산하거나 직접 INSERT 하지 않는다
    ovr DECIMAL(4, 1) AS ((stat1 + stat2 + stat3 + stat4 + stat5) / 5.0) STORED
        COMMENT '태생 5스탯 평균 (자동 계산)',

    rating     DECIMAL(4, 1)    NULL COMMENT '커뮤니티 분석 평점. 산출식 불명이라 값 그대로. 미수록은 NULL',
    rating_rev VARCHAR(20)      NULL COMMENT '현재 rating 의 출처 판본 (이력 아님)',

    created_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (legend_id),
    INDEX idx_dpls_ovr (ovr),
    INDEX idx_dpls_rating (rating),

    CONSTRAINT fk_dpls_legend FOREIGN KEY (legend_id)
        REFERENCES data_player_legend (id) ON DELETE CASCADE,

    -- 출처 없는 평점은 남기지 않는다. 빈 문자열·공백도 출처가 아니다
    CONSTRAINT chk_dpls_rating_rev CHECK (
        (rating IS NULL AND rating_rev IS NULL)
            OR
        (rating IS NOT NULL AND NULLIF(TRIM(rating_rev), '') IS NOT NULL)
        )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '레전드 태생 스탯 + 커뮤니티 평점';

-- ─────────────────────────────────────────────────────────────────────
-- 구종 코드
--
-- sort_no = 게임 UI 배치 순서. 화면에서 순서를 다시 정하지 않는다.
--   포심  투심  체인지업  서클체인지업  슬라이더
--   커브  포크  커터      싱커          스플리터
--
-- stat_group 은 야구학적 분류가 아니라 게임에서 영향받는 스탯 계열이다.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_pitch_type
(
    pitch_code VARCHAR(20)      NOT NULL COMMENT '구종 코드 (FOUR_SEAM, SLIDER ...)',
    pitch_name VARCHAR(20)      NOT NULL COMMENT '게임 UI 표기 그대로',
    stat_group ENUM ('FASTBALL','BREAKING')
                                NOT NULL COMMENT '영향 스탯. FASTBALL=stat4(직구), BREAKING=stat5(변화)',
    sort_no    TINYINT UNSIGNED NOT NULL COMMENT '게임 UI 배치 순서 (1~10)',

    PRIMARY KEY (pitch_code),
    UNIQUE KEY uk_dpt_name (pitch_name),
    UNIQUE KEY uk_dpt_sort (sort_no),

    CONSTRAINT chk_dpt_sort_no CHECK (sort_no BETWEEN 1 AND 10),

    -- ENUM 과 중복이 아니다. non-strict SQL mode 에서 잘못된 값이 에러 대신
    -- 특수 빈 문자열('')로 저장되는 경로를 막는다
    CONSTRAINT chk_dpt_stat_group CHECK (stat_group IN ('FASTBALL', 'BREAKING'))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '구종 코드 - 게임 UI 표기 순서 유지';

-- data_pitch_type 시드 데이터(마스터 10종)는 sql/V3_insert/INSERT_data_pitch_type.sql
-- 로 분리했다 (2026-09-13 재편 — DDL/INSERT 분리 원칙).

-- ─────────────────────────────────────────────────────────────────────
-- 레전드 투수 보유 구종
--
-- 보유한 구종만 행이 생긴다 (미보유 = 행 없음). 미조사 등급은 NULL.
--
-- ENUM 선언 순서는 정렬 전용.  ORDER BY pitch_grade DESC → S A B C D E NULL
-- 등급 판별은 범위 비교 금지.  WHERE pitch_grade IN ('A','S')
--
-- 무결성 책임 — FK: 존재하는 레전드인가 / 애플리케이션: 그게 PITCHER 인가.
-- FK 로는 player_role 조건을 걸 수 없고, 트리거는 이 규모에 과하다.
--
-- ※ "A 등급까지 필요한 직구/변화 수치" 는 실측이 필요해 제외했다.
--    넣게 되면 required_stat SMALLINT NULL 추가.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_legend_pitch
(
    id          CHAR(36)    NOT NULL COMMENT '식별자 (UUID v4)',
    legend_id   CHAR(36)    NOT NULL COMMENT 'data_player_legend.id. PITCHER 여부는 애플리케이션에서 검증',
    pitch_code  VARCHAR(20) NOT NULL COMMENT 'data_pitch_type.pitch_code',

    pitch_grade ENUM ('E','D','C','B','A','S')
                            NULL COMMENT '태생 구종 등급. 미조사분은 NULL',

    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    UNIQUE KEY uk_dplp (legend_id, pitch_code),
    INDEX idx_dplp_grade (pitch_grade),

    CONSTRAINT fk_dplp_legend FOREIGN KEY (legend_id)
        REFERENCES data_player_legend (id) ON DELETE CASCADE,

    -- 구종 마스터는 삭제 전파 대상이 아니다 (참조 중이면 삭제가 막혀야 한다)
    CONSTRAINT fk_dplp_type FOREIGN KEY (pitch_code)
        REFERENCES data_pitch_type (pitch_code),

    CONSTRAINT chk_dplp_pitch_grade CHECK (
        pitch_grade IS NULL OR pitch_grade IN ('E', 'D', 'C', 'B', 'A', 'S')
        )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '레전드 투수 보유 구종 + 태생 등급';

-- =====================================================================
-- 선수 카드 마스터
--
-- 1행 = 구단 × 연도 × 포지션 × 선수 × 카드종류 의 카드 원형.
-- 실제 카드 한 장이 아니라 그 원형이다 — NORMAL 한 행이 노말·레어·스페셜·히어로·플래티넘
-- 다섯 단계를 대표하고, has_signature 도 별도 카드가 아니라 시그니처 보유 여부다.
-- 단계별 스탯은 이 행을 card_id 로 참조하는 별도 테이블이 갖는다.
--
-- 1단계 시드는 엑셀 「선수」 시트(포지션 조사 최종본) 기준 11,668행,
-- NORMAL 카드만 적재한다. ALLSTAR/NATIONAL/GOLDEN_GLOVE/MVP/EPIC 은 2단계에서 추가.
--
-- 등급 컬럼은 두지 않는다 — card_type 에서 파생된다:
--   NORMAL                                → 노말~플래티넘 (+시그니처는 has_signature 로 별도 표시)
--   ALLSTAR / NATIONAL / GOLDEN_GLOVE / MVP → 스페셜~플래티넘
--   EPIC                                   → 에픽
--
-- id 는 UUID v5 (scripts/gen_player_card_seed.py 가 이름에서 계산 — 재실행해도 동일 id).
-- =====================================================================

USE compyafun;

-- DROP TABLE IF EXISTS data_player_card;

CREATE TABLE data_player_card
(
    id            CHAR(36)     NOT NULL COMMENT '선수 카드 식별자 (UUID v5)',
    player_name   VARCHAR(20)  NOT NULL COMMENT '선수명. 동명이인 접미 포함 (예: 김성한B). 실측 최대 5자(에스테베즈)',
    team_code     VARCHAR(10)  NOT NULL COMMENT '구단 코드 (fun_teams.team_code)',
    season_year   SMALLINT UNSIGNED
                               NOT NULL COMMENT '카드 연도. 레전드 카드(연도 없음)는 이 테이블에서 제외되므로 항상 존재',
    -- NOT NULL 인 이유: 둘 다 UNIQUE 키에 들어가는데 NULL 이 섞이면 MariaDB 가 중복 검사를 건너뛴다.
    -- 원본에 값이 없으면 적재 전에 판정해서 채운다(적재 스크립트가 실패시킨다).
    player_role   ENUM ('HITTER','PITCHER')
                               NOT NULL COMMENT '타자 / 투수',
    position_code VARCHAR(10)  NOT NULL COMMENT '포지션 코드 (SP, 3B 등). fun_player_card_positions 동일 도메인',
    sub_position_code VARCHAR(10) NULL COMMENT '부포지션. 겸업 선수만 채운다. 주포지션은 position_code (642건 백필: sql/V2_insert/UPDATE_sub_position.sql)',
    card_type     ENUM ('NORMAL','ALLSTAR','NATIONAL','GOLDEN_GLOVE','MVP','EPIC')
                               NOT NULL COMMENT '카드 종류. 1단계는 NORMAL 만 적재한다',
    has_signature BOOLEAN      NULL COMMENT 'NORMAL 일 때만 값을 갖는다 (시그니처/연대 시그니처 보유 여부)',

    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    -- 구단×연도×포지션×선수 가 유일 — card_type 을 맨 뒤에 붙이는 이유는 2단계에서 같은
    -- 선수·연도·포지션에 올스타/MVP/에픽 카드가 종류별로 공존해야 하기 때문 (1단계는 전부 NORMAL 이라
    -- 실질적으로 앞 4개 컬럼만으로 유일함과 같다).
    -- 앞 3개를 (team_code, season_year, position_code) 순으로 두어 구단×연도×포지션 조회에 이 인덱스가
    -- 그대로 쓰이도록 했다 — 그래서 이 인덱스와 겹치는 별도 idx_dpc_team_year_pos 는 두지 않는다.
    UNIQUE KEY uk_dpc_card (team_code, season_year, position_code, player_name, card_type),

    -- MariaDB 의 BOOLEAN 은 TINYINT(1) 별칭이라 2, 3 도 그냥 저장된다.
    -- 0/1 만 허용하도록 값 범위까지 함께 막는다.
    CONSTRAINT chk_dpc_signature CHECK (
        (card_type = 'NORMAL' AND has_signature IN (0, 1))
            OR
        (card_type <> 'NORMAL' AND has_signature IS NULL)
        )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '선수 카드 마스터 - 구단×연도×포지션→선수 매핑의 기준';

-- ─────────────────────────────────────────────────────────────────────
-- 검증 쿼리 (적재 후 확인용 — 실행은 사용자가 한다)
-- ─────────────────────────────────────────────────────────────────────

-- 1) 카드 종류별 건수
-- SELECT card_type, COUNT(*) AS cnt
-- FROM data_player_card
-- GROUP BY card_type
-- ORDER BY cnt DESC;

-- 2) has_signature 규칙 위반 행 (0이어야 정상)
-- SELECT *
-- FROM data_player_card
-- WHERE (card_type = 'NORMAL' AND has_signature IS NULL)
--    OR (card_type <> 'NORMAL' AND has_signature IS NOT NULL);

-- 3) (구단×연도×포지션) 에 선수가 1명뿐인 조합 수
--    같은 선수가 카드 종류 수만큼 여러 행을 가지므로 COUNT(*) 로 세면 중복 계산된다.
--    반드시 COUNT(DISTINCT player_name) = 1 로 세어야 "그 조합의 유일한 선수"를 뜻한다.
--    (1단계는 card_type 이 전부 NORMAL 이라 선수당 행이 1개뿐이므로 지금 당장은 COUNT(*) 와
--     결과가 같다 — 2단계에서 종류가 늘어나는 순간부터 이 차이가 실제로 벌어진다.)
-- SELECT COUNT(*) AS unique_combo_cnt
-- FROM (
--     SELECT team_code, season_year, position_code
--     FROM data_player_card
--     WHERE position_code IS NOT NULL
--     GROUP BY team_code, season_year, position_code
--     HAVING COUNT(DISTINCT player_name) = 1
-- ) t;

-- ── 원본: data_player_card_stat.sql (병합 — 2026-09-13 재편) ──
-- =====================================================================
-- 노말 카드 스탯 스키마 (data_player_legend_stat 오마주)
--
--   data_player_card_stat   태생 5스탯 + OVR         (카드 1:1)
--   data_player_card_pitch  투수 카드 보유 구종 + 등급  (1:N)
--
-- 스탯은 legend 와 같은 stat1~stat5 중립 슬롯을 쓴다. 카드 등급(노말~플래티넘)별
-- 스탯이 아니라 카드 원형(data_player_card) 1장당 태생 스탯 1세트다.
-- 화면 라벨은 애플리케이션(PlayerStatLabel)이 player_role 로 결정한다.
--
-- legend 와 다른 점 — rating / rating_rev(커뮤니티 평점)를 두지 않는다.
-- 노말 카드는 게임 화면 실측치라 "출처 불명 평점"이라는 개념 자체가 없다.
--
-- id 는 애플리케이션(파이썬) 생성 UUID. MariaDB UUID() 는 v1 이라 쓰지 않는다.
-- data_player_card_stat 은 별도 id 없이 PK 가 card_id 다(legend_stat 이 PK=legend_id 인 것과 동일).
-- data_player_card_pitch 의 id 는 UUID v5(카드id+구종코드 기반) — 근거는 아래 테이블 주석.
-- =====================================================================

USE compyafun;

-- FK 호환 확인 — 부모 data_player_card.id 와 COLUMN_TYPE / COLLATION_NAME 이 같아야 한다
-- SELECT COLUMN_TYPE, COLLATION_NAME FROM information_schema.COLUMNS
--  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'data_player_card' AND COLUMN_NAME = 'id';

-- DROP TABLE IF EXISTS data_player_card_pitch;
-- DROP TABLE IF EXISTS data_player_card_stat;

-- ─────────────────────────────────────────────────────────────────────
-- 노말 카드 태생 스탯
--
--   HITTER  stat1 정확 / stat2 파워 / stat3 선구 / stat4 주력 / stat5 수비
--   PITCHER stat1 제구 / stat2 구위 / stat3 체력 / stat4 직구 / stat5 변화
--
-- 정본: test-docs/노말선수_스탯,구종등급_정리_최종본.xlsx (게임 화면 실측, 3회 교차검수).
-- 에픽 카드는 이 정본에 스탯이 비어 있어 이번 적재 범위 밖이다.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_card_stat
(
    card_id CHAR(36)         NOT NULL COMMENT 'data_player_card.id. 카드 원형 1장당 1행',

    stat1   TINYINT UNSIGNED NOT NULL COMMENT '타자 정확 / 투수 제구',
    stat2   TINYINT UNSIGNED NOT NULL COMMENT '타자 파워 / 투수 구위',
    stat3   TINYINT UNSIGNED NOT NULL COMMENT '타자 선구 / 투수 체력',
    stat4   TINYINT UNSIGNED NOT NULL COMMENT '타자 주력 / 투수 직구',
    stat5   TINYINT UNSIGNED NOT NULL COMMENT '타자 수비 / 투수 변화',

    -- 기본 정렬 키. 애플리케이션에서 계산하거나 직접 INSERT 하지 않는다
    ovr DECIMAL(4, 1) AS ((stat1 + stat2 + stat3 + stat4 + stat5) / 5.0) STORED
        COMMENT '태생 5스탯 평균 (자동 계산)',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (card_id),
    INDEX idx_dpcs_ovr (ovr),

    CONSTRAINT fk_dpcs_card FOREIGN KEY (card_id)
        REFERENCES data_player_card (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '노말 카드 태생 스탯 (게임 화면 실측)';

-- ─────────────────────────────────────────────────────────────────────
-- 노말 카드 보유 구종 (투수 카드만)
--
-- 구종 마스터는 data_pitch_type 을 그대로 쓴다(legend 와 공용, 이 파일에서 새로 만들지 않는다).
--
-- 엑셀 「투수_구종등급」시트의 '-'(그 구종 없음)는 행으로 만들지 않는다 — 즉 보유한
-- 구종만 행이 생긴다(미보유 = 행 없음, legend_pitch 와 동일한 설계).
--
-- pitch_grade 를 NOT NULL 로 한다 — legend_pitch 는 "아직 조사 못 한 구종"이 있을 수 있어
-- NULL 을 허용했지만, 여기 정본은 게임 화면을 12,000회 캡처해 3회 교차검수한 표라 '-' 가
-- 아닌 칸은 전부 등급이 확정돼 있다. 미확정 상태로 행만 먼저 넣을 일이 없으므로 NULL 을
-- 열어둘 이유가 없다 — 등급 없는 행이 생기면 그 자체가 데이터 오류다.
--
-- ENUM 선언 순서는 정렬 전용. 노말 카드는 실측상 A~D 만 나오지만 E/S 도 열어둔다
-- (legend 와 등급 체계를 공유해야 두 테이블을 나란히 볼 때 등급 의미가 갈리지 않는다).
--
-- 무결성 책임 — FK: 존재하는 카드인가 / 생성 스크립트: 그 카드가 PITCHER 인가.
-- FK 로는 player_role 조건을 걸 수 없고, legend_pitch 와 같은 이유로 트리거는 이 규모에
-- 과하다고 판단했다 — scripts/gen_card_stat_sql.py 가 엑셀의 '타자/투수' 열로 걸러
-- PITCHER 카드에만 행을 만들고, 적재 SQL 끝의 검증 쿼리로 위반 여부를 확인한다.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_card_pitch
(
    id          CHAR(36)    NOT NULL COMMENT '식별자 (UUID v5, card_id+pitch_code 기반)',
    card_id     CHAR(36)    NOT NULL COMMENT 'data_player_card.id. PITCHER 여부는 생성 스크립트가 검증',
    pitch_code  VARCHAR(20) NOT NULL COMMENT 'data_pitch_type.pitch_code',

    pitch_grade ENUM ('E','D','C','B','A','S')
                            NOT NULL COMMENT '태생 구종 등급. 행이 있으면 항상 확정값(위 주석 참고)',

    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    UNIQUE KEY uk_dpcp (card_id, pitch_code),
    INDEX idx_dpcp_grade (pitch_grade),

    CONSTRAINT fk_dpcp_card FOREIGN KEY (card_id)
        REFERENCES data_player_card (id) ON DELETE CASCADE,

    -- 구종 마스터는 삭제 전파 대상이 아니다 (참조 중이면 삭제가 막혀야 한다)
    CONSTRAINT fk_dpcp_type FOREIGN KEY (pitch_code)
        REFERENCES data_pitch_type (pitch_code),

    CONSTRAINT chk_dpcp_pitch_grade CHECK (
        pitch_grade IN ('E', 'D', 'C', 'B', 'A', 'S')
        )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '노말 카드(투수) 보유 구종 + 태생 등급';

-- ─────────────────────────────────────────────────────────────────────
-- data_player_legend_material.player_card_id → data_player_card(id) FK
--
-- sql/V3/CREATE_02_data_player_legend.sql 이 player_card_id 컬럼은 먼저 선언하지만,
-- 여기 data_player_card 가 이 파일에서야 생성되므로 FK 는 두 테이블이 다 있는
-- 이 시점(CREATE_03 끝)에서 건다. 값 연결(백필)은 스키마가 아니라 데이터이므로
-- sql/V2/UPDATE_material_card_id_link.sql 이 따로 담당한다.
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE data_player_legend_material
    ADD CONSTRAINT fk_dplm_card FOREIGN KEY (player_card_id)
        REFERENCES data_player_card (id) ON DELETE RESTRICT;

-- =====================================================================
-- 선수 스킬 스키마
--
--   data_player_skill             스킬 마스터 (타자 46 + 투수 46 = 92행)
--   data_player_skill_tier        스킬 × 강화 티어 (540행)
--   data_player_skill_tier_value  설명문에 치환될 수치
--
-- id 는 UUID v5. 아래 이름에서 계산되므로 시드를 다시 만들어도 값이 같다.
--   skill        skill:{role}:{name}
--   tier         skill_tier:{role}:{name}:{tier}
--   tier_value   skill_tier_value:{role}:{name}:{tier}:{order}
-- 생성 규칙은 scripts/convert_skill_seed.py 에 있다.
-- =====================================================================

USE compyafun;

-- DROP TABLE IF EXISTS data_player_skill_tier_value;
-- DROP TABLE IF EXISTS data_player_skill_tier;
-- DROP TABLE IF EXISTS data_player_skill;

-- ─────────────────────────────────────────────────────────────────────
-- 스킬 마스터
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_skill
(
    id                   CHAR(36)         NOT NULL COMMENT '스킬 식별자',
    player_role          ENUM ('HITTER','PITCHER')
                                          NOT NULL COMMENT '선수 구분',
    skill_name           VARCHAR(32)      NOT NULL COMMENT '스킬명',
    skill_grade          ENUM ('NORMAL','HERO','PLATINUM','LEGEND')
                                          NOT NULL COMMENT '스킬 등급',
    max_tier             ENUM ('E','D','C','B','A','S','S+')
                                          NOT NULL COMMENT '최고 강화 티어',
    sort_order           TINYINT UNSIGNED NOT NULL COMMENT '정렬 순서',
    description_template VARCHAR(512)     NOT NULL COMMENT '스킬 설명 원문',
    value_count          TINYINT UNSIGNED NOT NULL COMMENT '치환 수치 개수',
    value_groups         VARCHAR(32)      NOT NULL COMMENT '수치 묶음 구조',
    source_row           SMALLINT UNSIGNED NULL COMMENT '원본 자료 행번호',

    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    -- 캡틴·슈퍼스타·베테랑은 타자/투수 양쪽에 있어 이름만으로는 유니크하지 않다
    UNIQUE KEY uk_dps_role_name (player_role, skill_name),
    UNIQUE KEY uk_dps_role_order (player_role, sort_order),
    INDEX idx_dps_grade (player_role, skill_grade),

    CONSTRAINT chk_dps_max_tier CHECK (
        (skill_grade IN ('NORMAL', 'HERO') AND max_tier = 'A')
            OR
        (skill_grade IN ('PLATINUM', 'LEGEND') AND max_tier = 'S+')
        )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '선수 스킬 마스터';

-- ─────────────────────────────────────────────────────────────────────
-- 스킬 × 강화 티어
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_skill_tier
(
    id         CHAR(36)    NOT NULL COMMENT '티어 식별자',
    skill_id   CHAR(36)    NOT NULL COMMENT 'data_player_skill.id',
    tier       ENUM ('E','D','C','B','A','S','S+')
                           NOT NULL COMMENT '강화 티어',
    raw_value  VARCHAR(64) NOT NULL COMMENT '티어별 수치 원문',
    estimated  BOOLEAN     NOT NULL DEFAULT FALSE COMMENT '추정값 여부',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    UNIQUE KEY uk_dpst_skill_tier (skill_id, tier),
    INDEX idx_dpst_estimated (estimated),

    CONSTRAINT fk_dpst_skill FOREIGN KEY (skill_id)
        REFERENCES data_player_skill (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '스킬 강화 티어';

-- ─────────────────────────────────────────────────────────────────────
-- 설명문 치환 수치
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_skill_tier_value
(
    id            CHAR(36)         NOT NULL COMMENT '수치 식별자',
    skill_tier_id CHAR(36)         NOT NULL COMMENT 'data_player_skill_tier.id',
    value_order   TINYINT UNSIGNED NOT NULL COMMENT '치환 순서',
    skill_value   SMALLINT         NOT NULL COMMENT '수치',

    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    UNIQUE KEY uk_dpstv_order (skill_tier_id, value_order),

    CONSTRAINT fk_dpstv_tier FOREIGN KEY (skill_tier_id)
        REFERENCES data_player_skill_tier (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '스킬 티어별 수치';


-- =====================================================================
-- 검증 쿼리. 적재 후 넷 다 0행이면 정상. 기대 행 수 92 / 540
-- =====================================================================

-- ① 설명문의 {n} 개수 ↔ value_count ↔ 실제 수치 개수
-- SELECT s.skill_name, t.tier,
--        CHAR_LENGTH(s.description_template)
--            - CHAR_LENGTH(REPLACE(s.description_template, '{', '')) AS placeholders,
--        s.value_count, COUNT(v.id) AS actual
-- FROM   data_player_skill s
--            JOIN data_player_skill_tier t ON t.skill_id = s.id
--            LEFT JOIN data_player_skill_tier_value v ON v.skill_tier_id = t.id
-- GROUP  BY t.id
-- HAVING placeholders <> s.value_count OR actual <> s.value_count;

-- ② 티어가 등급 상한과 다르거나 개수가 모자람
-- SELECT s.player_role, s.skill_name, s.skill_grade, s.max_tier,
--        MAX(t.tier) AS top, COUNT(*) AS tiers
-- FROM   data_player_skill s JOIN data_player_skill_tier t ON t.skill_id = s.id
-- GROUP  BY s.id
-- HAVING top <> s.max_tier OR tiers <> IF(s.max_tier = 'A', 5, 7);

-- ③ raw_value 가 수치와 어긋남
-- SELECT s.skill_name, t.tier, t.raw_value, f.flat
-- FROM   data_player_skill_tier t
--            JOIN data_player_skill s ON s.id = t.skill_id
--            JOIN (SELECT skill_tier_id,
--                         GROUP_CONCAT(skill_value ORDER BY value_order SEPARATOR ',') AS flat
--                  FROM data_player_skill_tier_value GROUP BY skill_tier_id) f
--                 ON f.skill_tier_id = t.id
-- WHERE  REPLACE(t.raw_value, '/', ',') <> f.flat;

-- ④ value_groups 의 묶음 수가 value_count 를 넘음
-- SELECT skill_name, value_groups, value_count
-- FROM   data_player_skill
-- WHERE  value_count <
--        CHAR_LENGTH(value_groups) - CHAR_LENGTH(REPLACE(value_groups, ',', '')) + 1;
