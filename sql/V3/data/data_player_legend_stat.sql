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

INSERT INTO data_pitch_type (pitch_code, pitch_name, stat_group, sort_no)
VALUES ('FOUR_SEAM', '포심', 'FASTBALL', 1),
       ('TWO_SEAM', '투심', 'FASTBALL', 2),
       ('CHANGEUP', '체인지업', 'BREAKING', 3),
       ('CIRCLE_CHANGEUP', '서클체인지업', 'BREAKING', 4),
       ('SLIDER', '슬라이더', 'BREAKING', 5),
       ('CURVE', '커브', 'BREAKING', 6),
       ('FORKBALL', '포크', 'BREAKING', 7),
       ('CUTTER', '커터', 'FASTBALL', 8),
       ('SINKER', '싱커', 'FASTBALL', 9),
       ('SPLITTER', '스플리터', 'FASTBALL', 10);

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
