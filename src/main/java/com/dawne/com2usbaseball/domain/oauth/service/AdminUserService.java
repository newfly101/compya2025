package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserListRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserRoleRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserStatusRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.response.AdminUserResponse;

import java.util.List;

public interface AdminUserService {

    List<AdminUserResponse> getAdminUserList(AdminUserListRequest request);

    AdminUserResponse getAdminUserDetail(Long userId);

    void updateUserRole(Long requesterId, Long userId, AdminUserRoleRequest request);

    void updateUserStatus(Long requesterId, Long userId, AdminUserStatusRequest request);
}
