package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CommentRequest {
    private Long postId;
    private Long parentCommentId;
    private UserRoleType userRoleType;
    private Long authorId;
    private String authorName;
    private String content;
    private Boolean isVisible;
}
