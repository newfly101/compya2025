package com.dawne.com2usbaseball.domain.community.entity;

import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentEntity {
    private Long id;
    private Long postId;
    private Long parentCommentId;

    private UserRoleType userRoleType;
    private Long authorId;
    private String authorName;

    private String content;

    private Boolean isVisible;
    private Boolean isDeleted;

    private Integer likeCount;
    private Integer dislikeCount;
    private Integer reportCount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
}
