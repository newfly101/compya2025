package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.domain.community.dto.request.PostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.request.ReplacePostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostTagResponse;

public interface AdminPostTagService {

    PostTagResponse createPostTag(PostTagRequest request);

    void deletePostTag(Long postId, Long tagId);

    void replacePostTags(ReplacePostTagRequest request);
}
