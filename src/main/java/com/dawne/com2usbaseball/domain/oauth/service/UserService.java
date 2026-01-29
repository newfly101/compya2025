package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.entity.UserRoleEntity;

public interface UserService {

    UserEntity findOrCreateNaverUser (NaverOAuthUserResponse info);
    UserEntity createUser (NaverOAuthUserResponse info);
    UserEntity findActiveUserById (int userId);
    UserRoleEntity findUserRoleByUserId (int userId);
}
