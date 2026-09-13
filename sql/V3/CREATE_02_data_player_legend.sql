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
