package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.ReadRoleType;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BoardRequest {

    private String code;
    private String name;
    private String description;

    private UserRoleType userRoleType;
    private ReadRoleType readRoleType;

    private Boolean useComment;
    private Boolean useLike;
    private Boolean useTag;

    private Boolean isVisible;
    private Integer sortOrder;
}
