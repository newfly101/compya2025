CREATE TABLE site_coupons
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    coupon_code VARCHAR(100) NOT NULL UNIQUE,
    title       VARCHAR(255) NOT NULL,
    detail      VARCHAR(500),
    expire_at   DATETIME     NOT NULL,
    is_visible  BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
