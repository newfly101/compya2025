package com.dawne.com2usbaseball.domain.oauth.controller;

import com.dawne.com2usbaseball.domain.oauth.controller.docs.UserSwaggerDocs;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.domain.oauth.exception.AuthException;
import com.dawne.com2usbaseball.domain.oauth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/users")
public class UserController implements UserSwaggerDocs {

    private final UserService userService;

    @Override
    @GetMapping("/me")
    public UserMeResponse getMe(HttpServletRequest request) {

        Long userId = (Long) request.getAttribute("userId");

        if (userId == null) {
            throw new AuthException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        UserEntity user = userService.findActiveUserById(userId);

        return userService.getUserHealth(user);
    }
}
