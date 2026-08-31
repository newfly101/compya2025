package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserListRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserRoleRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserStatusRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.response.AdminUserResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AdminUserMessages;
import com.dawne.com2usbaseball.domain.oauth.repository.RefreshTokenRepository;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public List<AdminUserResponse> getAdminUserList(AdminUserListRequest request) {
        List<UserEntity> users = userRepository.findAdminUserList(
                request.nickname(),
                request.userRole(),
                request.userStatus(),
                request.size(),
                request.offset()
        );
        return users.stream()
                .map(u -> AdminUserResponse.from(
                        u.getId(),
                        u.getNickname(),
                        u.getEmail(),
                        u.getUserRole(),
                        u.getUserStatus(),
                        u.getLastLoginAt(),
                        u.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public AdminUserResponse getAdminUserDetail(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(AdminUserMessages.ADMIN_USER_NOT_FOUND, HttpStatus.NOT_FOUND));
        return AdminUserResponse.from(
                user.getId(),
                user.getNickname(),
                user.getEmail(),
                user.getUserRole(),
                user.getUserStatus(),
                user.getLastLoginAt(),
                user.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public void updateUserRole(Long requesterId, Long userId, AdminUserRoleRequest request) {
        // 본인 역할 변경 방지
        if (requesterId != null && requesterId.equals(userId)) {
            throw new BaseException(AdminUserMessages.ADMIN_USER_SELF_ROLE_CHANGE_FORBIDDEN, HttpStatus.FORBIDDEN);
        }
        userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(AdminUserMessages.ADMIN_USER_NOT_FOUND, HttpStatus.NOT_FOUND));
        userRepository.updateUserRole(userId, request.userRole());

        // 역할 변경 시 기존 refresh token 전부 삭제 — access token(30분)이 만료되기 전까지는
        // 예전 role 클레임으로 계속 동작하지만, 재발급을 시도하는 시점부터는 재로그인으로 유도된다.
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Override
    @Transactional
    public void updateUserStatus(Long requesterId, Long userId, AdminUserStatusRequest request) {
        // 본인 상태 변경 방지 — 관리자가 자기 자신을 탈퇴/차단 처리해 되돌릴 방법이 없어지는 것을 막는다.
        if (requesterId != null && requesterId.equals(userId)) {
            throw new BaseException(AdminUserMessages.ADMIN_USER_SELF_STATUS_CHANGE_FORBIDDEN, HttpStatus.FORBIDDEN);
        }
        userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(AdminUserMessages.ADMIN_USER_NOT_FOUND, HttpStatus.NOT_FOUND));
        userRepository.updateUserStatus(userId, request.userStatus());

        // 상태 변경 시에도 기존 refresh token 전부 삭제. ACTIVE 로 되돌리는 경우도 포함 —
        // 되돌리기 전 상태 변경 시점에 이미 삭제됐을 가능성이 높아 대개는 삭제 대상이 없고,
        // 무효화 여부를 상태값별로 분기하면 판단 로직이 늘고 놓치는 case 가 생기므로
        // "상태가 바뀌면 무조건 무효화" 로 단순화한다.
        refreshTokenRepository.deleteByUserId(userId);
    }
}
