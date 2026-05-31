package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserListRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserRoleRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserStatusRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.response.AdminUserResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AdminUserMessages;
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
    }

    @Override
    @Transactional
    public void updateUserStatus(Long requesterId, Long userId, AdminUserStatusRequest request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(AdminUserMessages.ADMIN_USER_NOT_FOUND, HttpStatus.NOT_FOUND));
        userRepository.updateUserStatus(userId, request.userStatus());
    }
}
