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

CREATE TABLE skill_pitcher_grade_stat
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,

    skill_code  VARCHAR(10)               NOT NULL,
    target      ENUM ('PITCHER','HITTER') NOT NULL,
    grade       CHAR(1)                   NOT NULL, -- E D C B A S

    control     INT DEFAULT 0,                      -- 제구
    velocity    INT DEFAULT 0,                      -- 구위
    stamina     INT DEFAULT 0,                      -- 체력
    fastball    INT DEFAULT 0,                      -- 직구
    breaking    INT DEFAULT 0,                      -- 변화

    effect_text VARCHAR(255)              NULL,

    CONSTRAINT uk_skill_grade
        UNIQUE (skill_code, target, grade),

    CONSTRAINT fk_skill_grade_stat_skill
        FOREIGN KEY (skill_code, target)
            REFERENCES player_skills (skill_code, target)
            ON DELETE CASCADE
);


CREATE TABLE users
(
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider            VARCHAR(20)  NOT NULL, -- NAVER
    provider_id         VARCHAR(100) NOT NULL, -- NAVER UNIQUE ID
    oauth_nickname      VARCHAR(20),
    oauth_email         VARCHAR(255),
    oauth_profile_image VARCHAR(500),
    oauth_age_range     VARCHAR(10),
    nickname            VARCHAR(20),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at       TIMESTAMP DEFAULT '0000-00-00 00:00:00',

    UNIQUE KEY uk_provider (provider, provider_id)
);


CREATE TABLE user_roles
(
    user_id    BIGINT PRIMARY KEY,
    role       ENUM ('ADMIN', 'USER') NOT NULL                      DEFAULT 'USER',
    status     ENUM ('ACTIVE', 'BLOCKED', 'WITHDRAWN', 'SUSPENDED') DEFAULT 'ACTIVE',
    ban_reason VARCHAR(255),
    created_at TIMESTAMP                                            DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP                                            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE CASCADE
);
