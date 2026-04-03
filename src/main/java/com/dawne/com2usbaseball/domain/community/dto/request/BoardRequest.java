package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.ReadRoleType;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
public record BoardRequest (
    String code,
    String name,
    String description,
    UserRoleType userRoleType,
    ReadRoleType readRoleType,
    Boolean useComment,
    Boolean useLike,
    Boolean useTag,
    Boolean isVisible,
    Integer sortOrder
){ }
