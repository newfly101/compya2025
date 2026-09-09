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
