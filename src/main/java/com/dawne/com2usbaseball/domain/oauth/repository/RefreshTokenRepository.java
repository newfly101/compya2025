package com.dawne.com2usbaseball.domain.oauth.repository;

import com.dawne.com2usbaseball.domain.oauth.entity.RefreshTokenEntity;
import com.dawne.com2usbaseball.domain.oauth.repository.mapper.RefreshTokenMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRepository {

    private final RefreshTokenMapper mapper;

    public void save(RefreshTokenEntity token) {
        mapper.insertRefreshToken(token);
    }

    public Optional<RefreshTokenEntity> findActiveByHash(String tokenHash) {
        return mapper.selectActiveByHash(tokenHash);
    }

    public int deleteByHash(String tokenHash) {
        return mapper.deleteByHash(tokenHash);
    }

    public int deleteByUserId(Long userId) {
        return mapper.deleteByUserId(userId);
    }

    public int deleteExpired() {
        return mapper.deleteExpired();
    }
}
