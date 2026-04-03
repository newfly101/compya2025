package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;

public interface UserService {
    UserEntity findOrCreateNaverUser(NaverOAuthUserResponse info);
    UserEntity findActiveUserById(Long userId);
    UserMeResponse getUserHealth(UserEntity user);
}
