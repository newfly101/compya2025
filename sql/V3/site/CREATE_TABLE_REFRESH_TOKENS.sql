-- Refresh token 저장 테이블
-- access token: stateless JWT (15~30분)
-- refresh token: 30일 만료, DB 행 단위 revocation 가능
--
-- 보안:
--  - token_hash 는 SHA-256(token) 16진수 64자. 평문 토큰은 DB 에 저장하지 않음
--  - 사용자가 refresh 호출 시 cookie 의 평문을 hash 해서 DB 와 비교
--  - 로그아웃 / 토큰 탈취 의심 시 해당 행 DELETE → 즉시 무효화

CREATE TABLE site_refresh_tokens
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY               COMMENT 'PK',
    user_id     BIGINT       NOT NULL                           COMMENT 'site_users.id',
    token_hash  CHAR(64)     NOT NULL                           COMMENT 'SHA-256(refresh token) hex',
    expires_at  DATETIME     NOT NULL                           COMMENT '만료 시각 (발급 시점 + 30일)',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발급 시각',
    revoked_at  DATETIME     NULL                               COMMENT '무효 처리 시각 (NULL = 활성)',

    UNIQUE KEY uk_refresh_token_hash (token_hash),
    INDEX idx_refresh_user_id (user_id),
    INDEX idx_refresh_expires_at (expires_at),
    CONSTRAINT fk_refresh_user
        FOREIGN KEY (user_id) REFERENCES site_users (id)
            ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT = '리프레시 토큰 저장소 (rotation + revocation 지원)';
