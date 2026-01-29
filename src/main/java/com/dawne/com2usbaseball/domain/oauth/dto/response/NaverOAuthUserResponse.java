package com.dawne.com2usbaseball.domain.oauth.dto.response;

public record NaverOAuthUserResponse(
        String id,
        String nickname,
        String email,
        String profileImage,
        String ageRange
) {
}
