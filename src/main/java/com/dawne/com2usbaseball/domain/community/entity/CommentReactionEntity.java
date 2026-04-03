package com.dawne.com2usbaseball.domain.community.entity;

import com.dawne.com2usbaseball.domain.community.enums.ReactionType;
import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
}
