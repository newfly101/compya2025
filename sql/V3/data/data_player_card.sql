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
