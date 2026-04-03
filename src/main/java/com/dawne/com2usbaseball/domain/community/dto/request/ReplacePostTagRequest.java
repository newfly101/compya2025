package com.dawne.com2usbaseball.domain.community.dto.request;

import java.util.List;

public record ReplacePostTagRequest(
        Long postId,
        List<Long> tagIds
) {
}
