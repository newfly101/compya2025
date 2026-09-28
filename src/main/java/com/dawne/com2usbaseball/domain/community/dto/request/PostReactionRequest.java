package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.ReactionType;
import jakarta.validation.constraints.NotNull;

public record PostReactionRequest(
        @NotNull Long postId,
        @NotNull ReactionType reaction
) {
}
