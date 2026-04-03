package com.dawne.com2usbaseball.domain.community.service.reaction;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.PostReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostReactionResponse;

public interface PostReactionService {

    ListResponse<PostReactionResponse> getPostReactionListByPostId(Long postId);

    ListResponse<PostReactionResponse> getPostReactionListByUserId(Long userId);

    PostReactionResponse getPostReaction(Long postId, Long userId);

    PostReactionResponse savePostReaction(PostReactionRequest request);

    void deletePostReaction(Long postId, Long userId);
}
