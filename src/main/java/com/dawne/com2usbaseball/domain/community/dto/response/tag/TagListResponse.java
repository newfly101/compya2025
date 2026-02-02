package com.dawne.com2usbaseball.domain.community.dto.response.tag;

import java.util.List;

public record TagListResponse(
        List<TagResponse> tags
) {
    public static TagListResponse of(List<TagResponse> tags) {
        return new TagListResponse(
                tags == null ? List.of() : tags);
    }
}
