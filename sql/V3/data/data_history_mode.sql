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

    roster_group  ENUM ('STARTING_BATTER','BENCH_BATTER',
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
        (roster_group = 'STARTING_BATTER' AND order_no BETWEEN 1 AND 9)
            OR (roster_group = 'BENCH_BATTER' AND order_no BETWEEN 1 AND 5)
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
--        SUM(r.roster_group = 'STARTING_BATTER')  AS starting_batter,
--        SUM(r.roster_group = 'BENCH_BATTER')     AS bench_batter,
--        SUM(r.roster_group = 'STARTING_PITCHER') AS starting_pitcher,
--        SUM(r.roster_group = 'RELIEF_PITCHER')   AS relief_pitcher,
--        SUM(r.roster_group = 'CLOSER')           AS closer
-- FROM data_history_round d
--          LEFT JOIN data_history_roster r ON r.round_id = d.id
-- GROUP BY d.id, d.day_no, d.round_no
-- HAVING total <> 25 OR starting_batter <> 9 OR bench_batter <> 5
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
