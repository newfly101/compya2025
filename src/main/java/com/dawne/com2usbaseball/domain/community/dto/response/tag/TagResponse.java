package com.dawne.com2usbaseball.domain.community.dto.response.tag;

import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record TagResponse(
        Long id,
        String code,
        String name,
        String description,
        boolean visible,
        boolean deleted,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime updatedAt
) {
    public static TagResponse from(TagEntity t) {
        return new TagResponse(
                t.getId(),
                t.getCode(),
                t.getName(),
                t.getDescription(),
                t.isVisible(),
                t.isDeleted(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
