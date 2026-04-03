package com.dawne.com2usbaseball.domain.community.dto.response;

import com.dawne.com2usbaseball.domain.community.enums.ReactionType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record CommentReactionResponse(
        Long id,
        Long commentId,
        Long userId,
        ReactionType reaction,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt
) {
}
