package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record TagChangeRequest(
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
    public TagEntity toEntity() {
        TagEntity t = new TagEntity();
        applyTo(t);
        return t;
    }

    public TagEntity toEntity(Long id) {
        TagEntity t = new TagEntity();
        t.setId(id);
        applyTo(t);
        return t;
    }


    private void applyTo(TagEntity t) {
        t.setCode(code);
        t.setName(name);
        t.setDescription(description);
        t.setVisible(visible);
        t.setDeleted(deleted);
        t.setCreatedAt(createdAt);
        t.setUpdatedAt(updatedAt);
    }
}
