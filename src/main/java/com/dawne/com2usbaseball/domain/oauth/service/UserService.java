package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.dto.PatchableString;
import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;

public interface UserService {
    UserEntity findOrCreateNaverUser(NaverOAuthUserResponse info);
    UserEntity findActiveUserById(Long userId);
    UserMeResponse getUserHealth(UserEntity user);

    /**
     * 마이페이지 정보 수정 (부분 수정).
     * nickname == null → 닉네임은 건드리지 않음. profileImage == null(자바 null, 키 자체가 없었음) → 프로필 이미지는 건드리지 않음.
     * profileImage.value() 가 null/빈 문자열이면 프로필 이미지를 비운다.
     */
    UserMeResponse updateMe(Long userId, String nickname, PatchableString profileImage);

    void withdraw(Long userId);
}
