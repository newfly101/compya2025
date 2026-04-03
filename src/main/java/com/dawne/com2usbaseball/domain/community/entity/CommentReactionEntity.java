package com.dawne.com2usbaseball.domain.community.entity;

import com.dawne.com2usbaseball.domain.community.enums.ReactionType;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentReactionEntity {
    private Long id;
    private Long commentId;
    private Long userId;
    private ReactionType reaction;

    private LocalDateTime createdAt;
}
