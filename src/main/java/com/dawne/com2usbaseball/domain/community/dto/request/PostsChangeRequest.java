package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.common.enums.user.UserGrant;
import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import com.dawne.com2usbaseball.domain.community.enums.PostsType;

public record PostsChangeRequest(
        Long boardId,
        UserGrant authorType,   // 'ADMIN', 'USER
        Long authorId,
        String authorName,
        String title,
        String content,
        PostsType linkType,     // 'INTERNAL', 'EXTERNAL
        String externalUrl,
        boolean pinned,
        boolean visible,
        int viewCount
) {
    public PostsEntity toEntity() {
        PostsEntity p = new PostsEntity();
        applyTo(p);
        return p;
    }

    public PostsEntity toEntity(Long id) {
        PostsEntity p = new PostsEntity();
        p.setId(id);
        applyTo(p);
        return p;
    }


    private void applyTo(PostsEntity p) {
        p.setBoardId(boardId);
        p.setAuthorType(authorType);
        p.setAuthorId(authorId);
        p.setAuthorName(authorName);
        p.setTitle(title);
        p.setContent(content);
        p.setLinkType(linkType);
        p.setExternalUrl(externalUrl);
        p.setPinned(pinned);
        p.setVisible(visible);
        p.setViewCount(viewCount);
    }
}
