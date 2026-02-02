package com.dawne.com2usbaseball.domain.community.dto.response.posts;

import java.util.List;

public record PostListResponse(
        List<PostResponse> posts
) {
    public static PostListResponse of(List<PostResponse> posts) {
        return new PostListResponse(
                posts == null ? List.of() : posts);
    }
}
