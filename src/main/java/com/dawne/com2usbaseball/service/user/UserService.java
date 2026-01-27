package com.dawne.com2usbaseball.service.user;

import com.dawne.com2usbaseball.dto.response.oauth.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.entity.UserEntity;
import com.dawne.com2usbaseball.entity.UserRoleEntity;

public interface UserService {

    UserEntity findOrCreateNaverUser (NaverOAuthUserResponse info);
    UserEntity createUser (NaverOAuthUserResponse info);
    UserEntity findActiveUserById (int userId);
    UserRoleEntity findUserRoleByUserId (int userId);
}
