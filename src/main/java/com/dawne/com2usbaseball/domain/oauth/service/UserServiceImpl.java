package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.dto.mapstruct.UserMapStruct;
import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import com.dawne.com2usbaseball.domain.oauth.repository.RefreshTokenRepository;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private static final int NICKNAME_MAX_LENGTH = 20;
    private static final int WITHDRAW_RETENTION_MONTHS = 1;

    private final UserRepository repository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapStruct userMapStruct;

    @Override
    @Transactional
    public UserEntity findOrCreateNaverUser(NaverOAuthUserResponse info) {
        UserEntity user = repository
                .findByProviderAndProviderId("NAVER", info.id())
                .map(this::reactivateIfEligible)
                .orElseGet(() -> {
                    UserEntity newUser = userMapStruct.toEntity(info);
                    newUser.setUserRole(UserRole.USER);
                    newUser.setUserStatus(UserStatus.ACTIVE);
                    return repository.save(newUser);
                });

        repository.updateUserLastLogin(user.getId());
        return user;
    }

    @Override
    public UserEntity findActiveUserById(Long userId) {
        UserEntity user = repository.findById(userId)
                .orElseThrow(() ->
                        new BaseException(AuthMessages.AUTH_USER_NOT_FOUND, HttpStatus.NOT_FOUND));

        switch (user.getUserStatus()) {
            case BLOCKED, SUSPENDED, WITHDRAWN ->
                    throw new BaseException(AuthMessages.AUTH_USER_BLOCKED, HttpStatus.FORBIDDEN);
            case ACTIVE -> { /* 정상 */ }
        }

        return user;
    }

    @Override
    public UserMeResponse getUserHealth(UserEntity user) {
        return userMapStruct.toHealthResponse(user);
    }

    @Override
    @Transactional
    public UserMeResponse updateNickname(Long userId, String nickname) {
        String trimmed = nickname == null ? "" : nickname.trim();
        if (trimmed.isEmpty() || trimmed.length() > NICKNAME_MAX_LENGTH) {
            throw new BaseException(AuthMessages.AUTH_INVALID_NICKNAME, HttpStatus.BAD_REQUEST);
        }

        UserEntity user = findActiveUserById(userId);
        repository.updateNickname(userId, trimmed);
        user.setNickname(trimmed);

        return userMapStruct.toHealthResponse(user);
    }

    @Override
    @Transactional
    public void withdraw(Long userId) {
        // 이미 WITHDRAWN/BLOCKED/SUSPENDED 인 계정은 여기서 AUTH_USER_BLOCKED 로 걸러짐 (중복 탈퇴 방지)
        findActiveUserById(userId);

        repository.updateUserStatus(userId, UserStatus.WITHDRAWN);
        refreshTokenRepository.deleteByUserId(userId);
    }

    /**
     * 탈퇴(WITHDRAWN) 계정이 보관 기간(1개월) 내 재로그인하면 ACTIVE 로 재활성화.
     * BLOCKED / SUSPENDED 는 대상이 아니며 그대로 반환 — 상위 validateUserStatus 에서 차단됨.
     *
     * [판단] site_users 에 탈퇴 시각 전용 컬럼(withdrawn_at)이 없어, 탈퇴 처리 시 함께 갱신되는
     * updated_at 을 탈퇴 기준 시각으로 사용한다.
     */
    private UserEntity reactivateIfEligible(UserEntity user) {
        if (user.getUserStatus() != UserStatus.WITHDRAWN) {
            return user;
        }

        LocalDateTime withdrawnAt = user.getUpdatedAt();
        boolean withinRetentionPeriod = withdrawnAt != null
                && withdrawnAt.isAfter(LocalDateTime.now().minusMonths(WITHDRAW_RETENTION_MONTHS));

        if (!withinRetentionPeriod) {
            // 보관 기간 경과 — 재활성화 대상 아님. WITHDRAWN 유지 (삭제 배치 대상, 이번 범위 아님)
            return user;
        }

        repository.updateUserStatus(user.getId(), UserStatus.ACTIVE);
        user.setUserStatus(UserStatus.ACTIVE);
        return user;
    }
}
