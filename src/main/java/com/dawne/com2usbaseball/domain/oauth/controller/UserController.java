package com.dawne.com2usbaseball.domain.oauth.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.oauth.controller.docs.UserSwaggerDocs;
import com.dawne.com2usbaseball.domain.oauth.dto.request.UserNicknameUpdateRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.service.UserService;
import com.dawne.com2usbaseball.security.cookie.AuthCookieFactory;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController implements UserSwaggerDocs {

    private final UserService userService;
    private final AuthCookieFactory cookieFactory;

    @Override
    @GetMapping("/me")
    public GlobalResponse<UserMeResponse> getMe(HttpServletRequest request) {
        Long userId = requireUserId(request);

        UserEntity user = userService.findActiveUserById(userId);
        UserMeResponse data = userService.getUserHealth(user);

        return GlobalResponse.success(AuthMessages.AUTH_SUCCESS, data);
    }

    @Override
    @PatchMapping("/me")
    public GlobalResponse<UserMeResponse> updateMe(
            HttpServletRequest request,
            @Valid @RequestBody UserNicknameUpdateRequest body
    ) {
        Long userId = requireUserId(request);

        UserMeResponse data = userService.updateNickname(userId, body.nickname());

        return GlobalResponse.success(AuthMessages.AUTH_NICKNAME_UPDATED, data);
    }

    @Override
    @DeleteMapping("/me")
    public GlobalResponse<Void> deleteMe(HttpServletRequest request, HttpServletResponse response) {
        Long userId = requireUserId(request);

        userService.withdraw(userId);

        response.addHeader(HttpHeaders.SET_COOKIE, cookieFactory.expireAccessToken(request).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookieFactory.expireRefreshToken(request).toString());

        return GlobalResponse.success(AuthMessages.AUTH_WITHDRAW_SUCCESS, null);
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        return userId;
    }
}
