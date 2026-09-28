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

        // [판단] 상태 검사를 rotation 삭제보다 먼저 한다 — 클래스 레벨 @Transactional 이라 검사 실패 예외가
        // 트랜잭션 전체를 롤백해 삭제까지 되돌린다(= 무효화했다고 믿은 refresh 가 되살아난다).
        // 정지·차단·탈퇴 계정의 refresh 는 상태를 바꾸는 쪽(AdminUserServiceImpl.updateUserStatus,
        // UserServiceImpl.withdraw)에서 이미 전량 삭제되고, 남아 있어도 매 재발급마다 여기서 다시 막힌다.
        // findActiveUserById 가 ACTIVE 외 상태를 전부 FORBIDDEN 으로 거르므로 별도 상태 검사는 중복이다.
        UserEntity user = userService.findActiveUserById(row.getUserId());

        // rotation — 기존 refresh 즉시 무효
        refreshTokenRepository.deleteByHash(hash);

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
