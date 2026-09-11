package com.dawne.com2usbaseball.domain.admin.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.admin.dto.response.UploadResponse;
import com.dawne.com2usbaseball.domain.admin.enums.UploadMessages;
import com.dawne.com2usbaseball.domain.admin.service.UploadService;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // 클래스 기본은 관리자 전용. /profile 는 메서드에서 개별적으로 재정의한다
@RequestMapping("/api/upload")
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/events")
    public GlobalResponse<UploadResponse> uploadImage(@RequestParam MultipartFile file) throws Exception {
        UploadResponse response = uploadService.uploadImage(file);
        return GlobalResponse.success(UploadMessages.UPLOAD_SUCCESS, response);
    }

    // 프로필 이미지는 관리자 전용이 아니라 로그인한 일반 사용자도 올릴 수 있어야 한다 — 클래스 기본(ADMIN)을 재정의
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/profile")
    public GlobalResponse<UploadResponse> uploadProfileImage(
            HttpServletRequest request,
            @RequestParam MultipartFile file
    ) throws Exception {
        Long userId = requireUserId(request);
        UploadResponse response = uploadService.uploadProfileImage(file, userId);
        return GlobalResponse.success(UploadMessages.UPLOAD_SUCCESS, response);
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }
}
