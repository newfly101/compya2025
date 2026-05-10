package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.dto.response.AuthTokens;
import com.dawne.com2usbaseball.domain.oauth.entity.RefreshTokenEntity;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.domain.oauth.repository.RefreshTokenRepository;
import com.dawne.com2usbaseball.domain.oauth.service.support.NaverOAuthService;
import com.dawne.com2usbaseball.security.provider.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final NaverOAuthService naverOAuthService;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserService userService;

    @Override
    public AuthTokens loginWithNaver(String code, String state) {
        UserEntity user = naverOAuthService.findOrCreateUser(code, state);
        validateUserStatus(user);
        return issueTokens(user);
    }

    @Override
    public AuthTokens refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new BaseException(AuthMessages.AUTH_REFRESH_TOKEN_INVALID, HttpStatus.UNAUTHORIZED);
        }

        String hash = jwtProvider.hashRefreshToken(rawRefreshToken);
        RefreshTokenEntity row = refreshTokenRepository.findActiveByHash(hash)
                .orElseThrow(() -> new BaseException(AuthMessages.AUTH_REFRESH_TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED));

        // rotation — 기존 refresh 즉시 무효
        refreshTokenRepository.deleteByHash(hash);

        UserEntity user = userService.findActiveUserById(row.getUserId());
        validateUserStatus(user);
        return issueTokens(user);
    }

    @Override
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) return;
        String hash = jwtProvider.hashRefreshToken(rawRefreshToken);
        refreshTokenRepository.deleteByHash(hash);
    }

    /** access + refresh 발급 + refresh DB 저장 */
    private AuthTokens issueTokens(UserEntity user) {
        String access = jwtProvider.createAccessToken(user.getId(), user.getUserRole().name());
        String refresh = jwtProvider.createRefreshToken();
        Duration ttl = jwtProvider.getRefreshTokenTtl();

        RefreshTokenEntity row = RefreshTokenEntity.builder()
                .userId(user.getId())
                .tokenHash(jwtProvider.hashRefreshToken(refresh))
                .expiresAt(LocalDateTime.now().plus(ttl))
                .build();
        refreshTokenRepository.save(row);

        return new AuthTokens(access, refresh);
    }

    private void validateUserStatus(UserEntity user) {
        switch (user.getUserStatus()) {
            case BLOCKED, SUSPENDED, WITHDRAWN ->
                    throw new BaseException(AuthMessages.AUTH_USER_BLOCKED, HttpStatus.FORBIDDEN);
            case ACTIVE -> { /* 정상 */ }
        }
    }
}
