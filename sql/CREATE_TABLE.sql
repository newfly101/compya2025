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
