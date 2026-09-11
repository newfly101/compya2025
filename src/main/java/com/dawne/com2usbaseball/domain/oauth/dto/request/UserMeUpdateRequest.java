package com.dawne.com2usbaseball.domain.oauth.dto.request;

import com.dawne.com2usbaseball.common.support.dto.PatchableString;
import jakarta.validation.constraints.Size;

/**
 * 마이페이지 정보 수정 요청 (부분 수정).
 *
 * - nickname: 키를 보내지 않으면(null) 닉네임은 그대로 둔다. 값을 보내면 검증 후 수정한다. 빈 값으로 비울 수는 없다
 * - profileImage: 키 자체가 없으면(null) 프로필 이미지는 그대로 둔다.
 *                 키가 있고 null/빈 문자열이면 프로필 이미지를 비운다(기본 이미지로 되돌림).
 *                 키가 있고 값이 있으면 그 주소로 교체한다 (반드시 /api/upload/profile 로 올린 주소여야 한다)
 */
public record UserMeUpdateRequest(
        @Size(max = 20)
        String nickname,
        PatchableString profileImage
) {
}
