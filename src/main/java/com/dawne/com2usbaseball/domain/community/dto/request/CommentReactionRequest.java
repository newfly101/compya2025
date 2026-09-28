package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.ReactionType;
import jakarta.validation.constraints.NotNull;

public record CommentReactionRequest(
        @NotNull Long commentId,
        @NotNull ReactionType reaction
) {
}
