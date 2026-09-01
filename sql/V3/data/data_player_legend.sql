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
    player_card_id       CHAR(36)    NULL COMMENT 'fun_player_card.id, 추후 FK 연결 예정',

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

    -- 선수 카드 마스터 적재 완료 후 추가
    -- CONSTRAINT fk_dplm_player_card FOREIGN KEY (player_card_id) REFERENCES fun_player_card (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '레전드 재료 - 선수 카드 6장 + 코치 세트 2묶음';
