package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.dto.PatchableString;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.admin.service.UploadService;
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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

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
    private final UploadService uploadService;

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
    public UserMeResponse updateMe(Long userId, String nickname, PatchableString profileImage) {
        UserEntity user = findActiveUserById(userId);

        // nickname == null → 키 자체를 안 보낸 것과 같은 취급 → 건드리지 않는다 (기존 "닉네임만 보내는" 요청 호환)
        if (nickname != null) {
            String trimmed = nickname.trim();
            if (trimmed.isEmpty() || trimmed.length() > NICKNAME_MAX_LENGTH) {
                throw new BaseException(AuthMessages.AUTH_INVALID_NICKNAME, HttpStatus.BAD_REQUEST);
            }
            repository.updateNickname(userId, trimmed);
            user.setNickname(trimmed);
        }

        // profileImage == null → 키를 아예 안 보냄 → 건드리지 않는다
        // profileImage.value() 가 null/빈 문자열 → 명시적으로 비움(기본 이미지로 되돌림)
        if (profileImage != null) {
            String oldValue = user.getProfileImage();
            String newValue = normalizeProfileImage(profileImage.value());

            repository.updateProfileImage(userId, newValue);
            user.setProfileImage(newValue);

            // [판단] 옛 파일은 트랜잭션이 실제로 커밋된 뒤에만 지운다 — 롤백되면 DB엔 옛 주소가 남는데
            // 파일이 먼저 지워지면 사용자 화면에서 이미지가 깨진다. 커밋 후 지우면 그런 불일치가 없다.
            if (oldValue != null && !oldValue.equals(newValue) && uploadService.isProfileImageUrl(oldValue)) {
                registerDeleteAfterCommit(oldValue);
            }
        }

        return userMapStruct.toHealthResponse(user);
    }

    // 사용자가 임의 URL 을 넣지 못하게 — 반드시 /api/upload/profile 로 우리 버킷에 올린 주소만 허용
    private String normalizeProfileImage(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String trimmed = raw.trim();
        if (!uploadService.isProfileImageUrl(trimmed)) {
            throw new BaseException(AuthMessages.AUTH_INVALID_PROFILE_IMAGE, HttpStatus.BAD_REQUEST);
        }
        return trimmed;
    }

    private void registerDeleteAfterCommit(String url) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            uploadService.deleteByUrl(url);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                uploadService.deleteByUrl(url);
            }
        });
    }

    @Override
    @Transactional
    public void withdraw(Long userId) {
        // 이미 WITHDRAWN/BLOCKED/SUSPENDED 인 계정은 여기서 AUTH_USER_BLOCKED 로 걸러짐 (중복 탈퇴 방지)
        findActiveUserById(userId);

        // [판단] 탈퇴는 1개월 보관 후 파기(재로그인 시 복구)라, profile_image 는 여기서 지우지 않는다.
        // 즉시 지우면 보관 기간 내 재로그인해도 이미지가 이미 없다 — 실제 파기는 별도 배치의 몫(이번 범위 아님)
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
