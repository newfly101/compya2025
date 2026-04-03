package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.ReactionType;

public record PostReactionRequest(
        Long postId,
        Long userId,
        ReactionType reaction
) {
}
