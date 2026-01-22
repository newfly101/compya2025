package com.dawne.com2usbaseball.dto.response.oauth;


import java.time.LocalDate;

public record NaverOAuthUserResponse(
        String id,
        String email,
        String nickname,
        String profileImage,
        LocalDate year,
        String phoneNumber,
        String gender
) {
}
