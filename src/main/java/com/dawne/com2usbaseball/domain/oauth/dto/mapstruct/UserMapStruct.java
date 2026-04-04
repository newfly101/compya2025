package com.dawne.com2usbaseball.domain.oauth.dto.mapstruct;

import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapStruct {

    /**
     * 사용자 Health 응답 변환
     */
    @Mapping(target = "nickname", source = "nickname")
    @Mapping(target = "email", source = "oauthEmail")
    @Mapping(target = "profileImage", source = "oauthProfileImage")
    @Mapping(target = "lastLoginAt", source = "lastLoginAt")
    UserMeResponse toHealthResponse(UserEntity entity);


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "provider", constant = "NAVER")
    @Mapping(target = "providerId", source = "id")
    @Mapping(target = "oauthNickname", source = "nickname")
    @Mapping(target = "oauthEmail", source = "email")
    @Mapping(target = "oauthProfileImage", source = "profileImage")
    @Mapping(target = "oauthAgeRange", source = "ageRange")
    @Mapping(target = "nickname", source = "nickname")
    @Mapping(target = "userRole", constant = "USER")
    @Mapping(target = "userStatus", constant = "ACTIVE")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    UserEntity toEntity(NaverOAuthUserResponse response);
}
