package com.dawne.com2usbaseball.domain.community.dto.response.posts;

import com.dawne.com2usbaseball.common.enums.user.UserGrant;
import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import com.dawne.com2usbaseball.domain.community.enums.PostsType;

public record PostResponse(
        Long id,
        Long boardId,
        UserGrant authorType,   // 'ADMIN', 'USER'
        Long authorId,
        String authorName,
        String title,
        String content,
        PostsType linkType,     // 'INTERNAL', 'EXTERNAL'
        String externalUrl,
        boolean planned,
        boolean visible,
        int viewCount
) {
    public static PostResponse from(PostsEntity p) {
        return new PostResponse(
                p.getId(),
                p.getBoardId(),
                p.getAuthorType(),
                p.getAuthorId(),
                p.getAuthorName(),
                p.getTitle(),
                p.getContent(),
                p.getLinkType(),
                p.getExternalUrl(),
                p.isPlanned(),
                p.isVisible(),
                p.getViewCount()
        );
    }
}
