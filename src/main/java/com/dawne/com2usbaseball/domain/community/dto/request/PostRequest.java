package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.LinkType;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
public record PostRequest (
    Long boardId,

    UserRoleType userRoleType,
    Long authorId,
    String authorName,

    String title,
    String content,

    LinkType linkType,
    String externalUrl,

    Boolean isPinned,
    Boolean isVisible
){ }
