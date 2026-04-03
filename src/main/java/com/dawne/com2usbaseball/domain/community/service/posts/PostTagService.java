package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.PostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.request.ReplacePostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostTagResponse;

public interface PostTagService {

    ListResponse<PostTagResponse> getPostTagListByPostId(Long postId);

    ListResponse<PostTagResponse> getPostTagListByTagId(Long tagId);

    PostTagResponse createPostTag(PostTagRequest request);

    void deletePostTag(Long postId, Long tagId);

    void replacePostTags(ReplacePostTagRequest request);
}
