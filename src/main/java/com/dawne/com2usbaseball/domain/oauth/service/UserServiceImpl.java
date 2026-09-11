package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.dto.PatchableString;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.admin.service.UploadService;
import com.dawne.com2usbaseball.domain.oauth.dto.mapstruct.UserMapStruct;
import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.entity.UserOAuthAccountEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import com.dawne.com2usbaseball.domain.oauth.repository.RefreshTokenRepository;
import com.dawne.com2usbaseball.domain.oauth.repository.UserOAuthAccountRepository;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private static final int NICKNAME_MAX_LENGTH = 20;
    private static final int WITHDRAW_RETENTION_MONTHS = 1;

    private final UserRepository repository;
    private final UserOAuthAccountRepository oauthAccountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapStruct userMapStruct;
    private final UploadService uploadService;

    @Override
    @Transactional
    public UserEntity findOrCreateNaverUser(NaverOAuthUserResponse info) {
        UserEntity user = repository
                .findByProviderAndProviderId("NAVER", info.id())
                .map(this::reactivateIfEligible)
                .orElseGet(() -> createUserWithOAuthAccount(info));

        repository.updateUserLastLogin(user.getId());
        return user;
    }

    // 가입 = site_users insert + site_user_oauth_accounts insert. findOrCreateNaverUser 의
    // @Transactional 안에서 실행되므로 둘 중 하나가 실패하면 함께 롤백된다 — 반쪽짜리 계정이 남지 않는다.
    private UserEntity createUserWithOAuthAccount(NaverOAuthUserResponse info) {
        UserEntity newUser = userMapStruct.toEntity(info);
        newUser.setPublicId(UUID.randomUUID().toString()); // MariaDB UUID() 는 v1(시각·MAC 포함)이라 쓰지 않는다
        newUser.setUserRole(UserRole.USER);
        newUser.setUserStatus(UserStatus.ACTIVE);
        UserEntity saved = repository.save(newUser);

        UserOAuthAccountEntity oauthAccount = userMapStruct.toOAuthAccountEntity(info, saved.getId());
        oauthAccountRepository.save(oauthAccount);

        // 방금 만든 값 — 재조회 없이 바로 응답에 쓸 수 있게 채워둔다 (JOIN 전용 읽기 필드)
        saved.setOauthEmail(oauthAccount.getEmail());
        saved.setOauthProfileImage(oauthAccount.getProfileImage());
        return saved;
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
            //
            // [판단] 프로필 이미지는 {publicId}.jpg 고정 파일명이라 재업로드해도 실제 S3 키는 그대로고
            // 캐시 무효화용 쿼리스트링(?v=...)만 바뀐다. 쿼리스트링만 다른 걸 "바뀐 파일"로 보고 지우면
            // 방금 덮어쓴 새 이미지 자체가 삭제된다 — 실제 키가 다를 때만 지운다.
            if (oldValue != null && uploadService.isProfileImageUrl(oldValue)
                    && (newValue == null || !sameStoredFile(oldValue, newValue))) {
                registerDeleteAfterCommit(oldValue);
            }
        }

        return userMapStruct.toHealthResponse(user);
    }

    // 캐시 무효화 쿼리스트링을 뗀 실제 S3 키가 같은지 비교
    private boolean sameStoredFile(String oldUrl, String newUrl) {
        return stripQuery(oldUrl).equals(stripQuery(newUrl));
    }

    private String stripQuery(String url) {
        int idx = url.indexOf('?');
        return idx < 0 ? url : url.substring(0, idx);
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
     * withdrawn_at 전용 컬럼 기준으로 판단한다. 예전에는 updated_at 을 탈퇴 시각 대용으로 썼는데,
     * 관리자가 권한만 바꿔도 updated_at 이 갱신돼 보관 기간 시계가 조용히 리셋되는 버그가 있었다.
     */
    private UserEntity reactivateIfEligible(UserEntity user) {
        if (user.getUserStatus() != UserStatus.WITHDRAWN) {
            return user;
        }

        LocalDateTime withdrawnAt = user.getWithdrawnAt();
        boolean withinRetentionPeriod = withdrawnAt != null
                && withdrawnAt.isAfter(LocalDateTime.now().minusMonths(WITHDRAW_RETENTION_MONTHS));

        if (!withinRetentionPeriod) {
            // 보관 기간 경과 — 재활성화 대상 아님. WITHDRAWN 유지 (삭제 배치 대상, 이번 범위 아님)
            return user;
        }

        repository.updateUserStatus(user.getId(), UserStatus.ACTIVE);
        user.setUserStatus(UserStatus.ACTIVE);
        user.setWithdrawnAt(null);
        return user;
    }
}
