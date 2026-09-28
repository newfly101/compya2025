package com.dawne.com2usbaseball.domain.oauth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenEntity {

    private Long id;
    private Long userId;
    private String tokenHash;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    // revoked_at 컬럼은 읽지 않는다 — 무효화는 하드 삭제 설계다 (RefreshTokenMapper.xml 상단 주석)
}
