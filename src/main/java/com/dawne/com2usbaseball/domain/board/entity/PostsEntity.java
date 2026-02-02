package com.dawne.com2usbaseball.domain.board.entity;

import com.dawne.com2usbaseball.common.enums.user.UserGrant;
import com.dawne.com2usbaseball.domain.board.enums.PostsType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostsEntity {
    private Long id;
    private Long boardId;
    private UserGrant authorType;   // 'ADMIN', 'USER'
    private Long authorId;
    private String authorName;
    private String title;
    private String content;
    private PostsType linkType;     // 'INTERNAL', 'EXTERNAL'
    private String externalUrl;
    private boolean planned;
    private boolean visible;
    private int viewCount;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
}
