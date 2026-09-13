-- =====================================================================
-- 격리된 legacy DDL — player_legend 계열 4테이블
--
-- 2026-09-13 sql/ 폴더 재편 시 sql/CREATE_TABLE.sql(V1 원본, 현 sql/V1/CREATE_TABLE_V1.sql)
-- 에서 분리했다. 분리 사유:
--   - BE(v2 브랜치) mapper/java 어디에서도 이 4테이블 참조 0건 (2026-09-13 실측)
--   - 운영 DB에는 여전히 실데이터 존재 (player_legend 62 / hitter_career 40 /
--     pitcher_career 22 / legend_pitcher_pitch_slot 22)
--   - 삭제는 사용자 결정 대기 — docs/global-guide/develop/specs/db/sql-folder-map.md §4,
--     table-classification.md §5-1 참조
--
-- 원본 파일 그대로 옮겼다. 내용 수정 없음.
-- =====================================================================

CREATE TABLE player_legend
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,

    card_code   VARCHAR(50)               NOT NULL, -- LEGEND_{ROLE}_{TEAM}_{PLAYER}
    name        VARCHAR(50)               NOT NULL,

    team_id     BIGINT                    NOT NULL, -- ⭐ FK

    role        ENUM ('HITTER','PITCHER') NOT NULL,
    grade       ENUM ('LEGEND')           NOT NULL DEFAULT 'LEGEND',
    overall     SMALLINT                  NOT NULL,
    back_number SMALLINT,
    birth_date  DATE,
    bat_throw   VARCHAR(10),

    positions   JSON                      NOT NULL,
    traits      JSON,
    attributes  JSON                      NOT NULL COMMENT 'control:제구, velocity:구위, stamina:체력, fastball:직구, breaking:변화',

    created_at  DATETIME                           DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_card_code (card_code),
    UNIQUE KEY uk_player_legend_name (name),
    INDEX idx_team_id (team_id),
    INDEX idx_role (role),

    CONSTRAINT fk_legend_team
        FOREIGN KEY (team_id)
            REFERENCES teams (id)
);


CREATE TABLE player_legend_hitter_career
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- 🔗 player_legend 참조
    name       VARCHAR(50) NOT NULL,

    -- 📊 커리어 스탯
    seasons    SMALLINT    NOT NULL,
    games      INT         NOT NULL,

    avg        DECIMAL(4, 3), -- 0.296
    at_bats    INT,
    hits       INT,
    doubles    INT,
    triples    INT,
    home_runs  INT,
    steals     INT,
    rbi        INT,
    runs       INT,
    strikeouts INT,
    walks      INT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- 🔍 조회 최적화
    UNIQUE KEY uk_player_hitter_name (name),

    CONSTRAINT fk_legend_hitter_career
        FOREIGN KEY (name)
            REFERENCES player_legend (name)
            ON DELETE CASCADE
            ON UPDATE CASCADE
);

CREATE TABLE player_legend_pitcher_career
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- 🔗 player_legend 참조
    name        VARCHAR(50) NOT NULL,

    -- 📊 커리어 스탯
    seasons     SMALLINT    NOT NULL,
    games       INT         NOT NULL,

    era         DECIMAL(4, 3), -- 0.296
    wins        INT,
    losses      INT,
    saves       INT,
    holds       INT,
    strikeouts  INT,
    walks       INT,
    hitsAllowed INT,

    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- 🔍 조회 최적화
    UNIQUE KEY uk_player_pitcher_name (name),

    CONSTRAINT fk_legend_pitcher_career
        FOREIGN KEY (name)
            REFERENCES player_legend (name)
            ON DELETE CASCADE
            ON UPDATE CASCADE
);

CREATE TABLE legend_pitcher_pitch_slot
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    pitcher_name  VARCHAR(50) NOT NULL,

    four_seam     CHAR(1)     NULL,
    two_seam      CHAR(1)     NULL,
    change_up     CHAR(1)     NULL,
    circle_change CHAR(1)     NULL,
    slider        CHAR(1)     NULL,
    curve         CHAR(1)     NULL,
    fork          CHAR(1)     NULL,
    cutter        CHAR(1)     NULL,
    sinker        CHAR(1)     NULL,
    splitter      CHAR(1)     NULL,

    CONSTRAINT pk_pitcher_pitch_slot_name
        UNIQUE (pitcher_name),

    CONSTRAINT fk_legend_pitcher_pitch_slot
        FOREIGN KEY (pitcher_name)
            REFERENCES player_legend (name)
            ON DELETE CASCADE,

    CONSTRAINT chk_pitch CHECK (
        (four_seam IN ('C', 'B', 'A', 'S') OR four_seam IS NULL)
            AND (two_seam IN ('C', 'B', 'A', 'S') OR two_seam IS NULL)
            AND (slider IN ('C', 'B', 'A', 'S') OR slider IS NULL)
            AND (curve IN ('C', 'B', 'A', 'S') OR curve IS NULL)
            AND (fork IN ('C', 'B', 'A', 'S') OR fork IS NULL)
            AND (sinker IN ('C', 'B', 'A', 'S') OR sinker IS NULL)
            AND (change_up IN ('C', 'B', 'A', 'S') OR change_up IS NULL)
            AND (circle_change IN ('C', 'B', 'A', 'S') OR circle_change IS NULL)
            AND (cutter IN ('C', 'B', 'A', 'S') OR cutter IS NULL)
            AND (splitter IN ('C', 'B', 'A', 'S') OR splitter IS NULL)
        )
);

-- ⚠️ 참고 — 이 4테이블의 FK 는 원본 그대로 `teams` / `player_legend` 를 참조한다.
-- `teams` DDL 은 격리하지 않고 sql/V1/CREATE_TABLE_V1.sql 에 남겼다 (BE 참조 판정이
-- 이 4개와 달라 별도 사용자 결정 사안 — sql-folder-map.md §4 참조). 이 파일만 단독
-- 실행하면 teams 테이블이 없어 FK 생성이 실패한다 — 실행 시 sql/V1/CREATE_TABLE_V1.sql
-- 의 teams DDL을 먼저 적용해야 한다.
