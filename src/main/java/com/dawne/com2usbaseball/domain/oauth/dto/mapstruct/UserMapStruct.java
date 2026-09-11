package com.dawne.com2usbaseball.domain.oauth.dto.mapstruct;

import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.entity.UserOAuthAccountEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapStruct {

    /**
     * 사용자 Health 응답 변환
     */
    @Mapping(target = "publicId", source = "publicId")
    @Mapping(target = "nickname", source = "nickname")
    @Mapping(target = "email", source = "oauthEmail")
    @Mapping(target = "profileImage", source = "profileImage")
    @Mapping(target = "oauthProfileImage", source = "oauthProfileImage")
    @Mapping(target = "lastLoginAt", source = "lastLoginAt")
    UserMeResponse toHealthResponse(UserEntity entity);


    /**
     * 신규 가입 — site_users 쪽 필드만 채운다. publicId 는 서비스 코드에서 UUID.randomUUID() 로 채우고,
     * OAuth 원본은 toOAuthAccountEntity() 로 별도 변환해 site_user_oauth_accounts 에 넣는다.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "publicId", ignore = true)
    @Mapping(target = "nickname", source = "nickname")
    // 서비스 자체 email 초기값 — 가입 시점 OAuth 이메일로 1회 복사. 이후 email 과 oauthEmail 은 서로 독립적으로 관리됨 (네이버 미동의 시 null 허용)
    @Mapping(target = "email", source = "email")
    @Mapping(target = "profileImage", ignore = true)
    @Mapping(target = "userRole", constant = "USER")
    @Mapping(target = "userStatus", constant = "ACTIVE")
    @Mapping(target = "oauthEmail", ignore = true)
    @Mapping(target = "oauthProfileImage", ignore = true)
    @Mapping(target = "withdrawnAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    UserEntity toEntity(NaverOAuthUserResponse response);

    /**
     * 신규 가입 — OAuth 원본 스냅샷을 site_user_oauth_accounts 행으로 변환. userId 는 site_users insert 로
     * 생성된 키를 그대로 넘겨받는다(파라미터 이름 userId 를 소스 접두어로 사용).
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "provider", constant = "NAVER")
    @Mapping(target = "providerId", source = "response.id")
    @Mapping(target = "nickname", source = "response.nickname")
    @Mapping(target = "email", source = "response.email")
    @Mapping(target = "profileImage", source = "response.profileImage")
    @Mapping(target = "ageRange", source = "response.ageRange")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    UserOAuthAccountEntity toOAuthAccountEntity(NaverOAuthUserResponse response, Long userId);
}
