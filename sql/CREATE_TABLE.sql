USE compyafun;

CREATE TABLE player_skills
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_code  VARCHAR(10)                                NOT NULL, -- L1, P3, H10 ...
    name        VARCHAR(50)                                NOT NULL, -- 슈퍼스타, 닥터K
    description TEXT,
    grade       ENUM ('LEGEND','PLATINUM','HERO','NORMAL') NOT NULL,
    target      ENUM ('PITCHER','HITTER')                  NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_skill_code_target (skill_code, target)
);

CREATE TABLE teams
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_code      VARCHAR(10) NOT NULL, -- SAM, DOO
    team_name      VARCHAR(50) NOT NULL, -- 삼성 라이온즈
    latest_team_id BIGINT      NULL,     -- 최신 구단 포함 여부
    city           VARCHAR(50),          -- 대구
    start_year     SMALLINT,             -- 1982
    end_year       SMALLINT,             -- 1991
    emblem_url     VARCHAR(255),         -- 로고

    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_team_code (team_code),
    INDEX idx_latest_team_id (latest_team_id),

    CONSTRAINT fk_latest_team
        FOREIGN KEY (latest_team_id)
            REFERENCES teams (id)
);

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
    attributes  JSON                      NOT NULL,

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
