package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.ReactionType;

public record CommentReactionRequest(
        Long commentId,
        Long userId,
        ReactionType reaction
) {
}
