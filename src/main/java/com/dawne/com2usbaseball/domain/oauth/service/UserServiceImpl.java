package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.dto.mapstruct.UserMapStruct;
import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final UserMapStruct userMapStruct;

    @Override
    @Transactional
    public UserEntity findOrCreateNaverUser(NaverOAuthUserResponse info) {
        UserEntity user = repository
                .findByProviderAndProviderId("NAVER", info.id())
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
}
