package com.dawne.com2usbaseball.domain.community.dto.response;

import com.dawne.com2usbaseball.domain.community.enums.ReactionType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record PostReactionResponse(
        Long id,
        Long postId,
        Long userId,
        ReactionType reaction,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt
) {
}
