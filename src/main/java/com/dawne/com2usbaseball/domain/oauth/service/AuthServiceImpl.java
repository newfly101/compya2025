package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.domain.oauth.service.support.NaverOAuthService;
import com.dawne.com2usbaseball.security.provider.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final NaverOAuthService naverOAuthService;
    private final JwtProvider jwtProvider;

    @Override
    public String loginWithNaver(String code, String state) {
        UserEntity user = naverOAuthService.findOrCreateUser(code, state);
        validateUserStatus(user);
        return jwtProvider.createAccessToken(user.getId(), user.getUserRole().name());
    }

    private void validateUserStatus(UserEntity user) {
        switch (user.getUserStatus()) {
            case BLOCKED, SUSPENDED, WITHDRAWN ->
                    throw new BaseException(AuthMessages.AUTH_USER_BLOCKED, HttpStatus.FORBIDDEN);
            case ACTIVE -> { /* 정상 */ }
        }
    }
}
