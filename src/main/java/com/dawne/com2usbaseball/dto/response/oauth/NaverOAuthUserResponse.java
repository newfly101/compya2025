package com.dawne.com2usbaseball.dto.response.oauth;

public record NaverOAuthUserResponse(
        String id,
        String nickname,
        String email,
        String profileImage,
        String ageRange
) {
}
