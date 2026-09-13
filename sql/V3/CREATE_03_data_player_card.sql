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
