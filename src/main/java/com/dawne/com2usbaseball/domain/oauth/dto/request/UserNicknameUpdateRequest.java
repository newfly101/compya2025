package com.dawne.com2usbaseball.domain.oauth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserNicknameUpdateRequest(
        @NotBlank
        @Size(max = 20)
        String nickname
) {
}
