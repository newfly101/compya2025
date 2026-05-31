package com.dawne.com2usbaseball.domain.oauth.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserListRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserRoleRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.request.AdminUserStatusRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.response.AdminUserResponse;
import com.dawne.com2usbaseball.domain.oauth.enums.AdminUserMessages;
import com.dawne.com2usbaseball.domain.oauth.service.AdminUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public GlobalResponse<List<AdminUserResponse>> getAdminUserList(AdminUserListRequest request) {
        List<AdminUserResponse> users = adminUserService.getAdminUserList(request);
        return GlobalResponse.success(AdminUserMessages.ADMIN_USER_LIST_SUCCESS, users);
    }

    @GetMapping("/{userId}")
    public GlobalResponse<AdminUserResponse> getAdminUserDetail(@PathVariable Long userId) {
        AdminUserResponse user = adminUserService.getAdminUserDetail(userId);
        return GlobalResponse.success(AdminUserMessages.ADMIN_USER_DETAIL_SUCCESS, user);
    }

    @PatchMapping("/{userId}/role")
    public GlobalResponse<Void> updateUserRole(
            HttpServletRequest request,
            @PathVariable Long userId,
            @Valid @RequestBody AdminUserRoleRequest roleRequest
    ) {
        Long requesterId = (Long) request.getAttribute("userId");
        adminUserService.updateUserRole(requesterId, userId, roleRequest);
        return GlobalResponse.success(AdminUserMessages.ADMIN_USER_ROLE_UPDATED, null);
    }

    @PatchMapping("/{userId}/status")
    public GlobalResponse<Void> updateUserStatus(
            HttpServletRequest request,
            @PathVariable Long userId,
            @Valid @RequestBody AdminUserStatusRequest statusRequest
    ) {
        Long requesterId = (Long) request.getAttribute("userId");
        adminUserService.updateUserStatus(requesterId, userId, statusRequest);
        return GlobalResponse.success(AdminUserMessages.ADMIN_USER_STATUS_UPDATED, null);
    }
}
