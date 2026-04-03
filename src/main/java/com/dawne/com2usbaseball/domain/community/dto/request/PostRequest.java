package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.LinkType;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PostRequest {

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
}
