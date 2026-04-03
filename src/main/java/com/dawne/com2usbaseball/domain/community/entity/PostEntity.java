package com.dawne.com2usbaseball.domain.community.entity;

import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.dawne.com2usbaseball.domain.community.enums.LinkType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostEntity {
    private Long id;
    private Long boardId;

    private UserRoleType userRoleType;
    private Long authorId;
    private String authorName;

    private String title;
    private String content;

    private LinkType linkType;
    private String externalUrl;

    private Boolean isPinned;
    private Boolean isVisible;
    private Boolean isDeleted;

    private Integer viewCount;
    private Integer commentCount;
    private Integer likeCount;
    private Integer dislikeCount;
    private Integer reportCount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
}
