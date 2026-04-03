package com.dawne.com2usbaseball.domain.community.entity;

import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.dawne.com2usbaseball.domain.community.enums.ReadRoleType;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardEntity {
    private Long id;
    private String code;
    private String name;
    private String description;

    private UserRoleType userRoleType;
    private ReadRoleType readRoleType;

    private Boolean useComment;
    private Boolean useLike;
    private Boolean useTag;

    private Boolean isVisible;
    private Boolean isDeleted;

    private Integer sortOrder;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
