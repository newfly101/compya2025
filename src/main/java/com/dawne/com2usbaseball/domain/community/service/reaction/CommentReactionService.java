package com.dawne.com2usbaseball.domain.community.service.reaction;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.CommentReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentReactionResponse;

public interface CommentReactionService {

    ListResponse<CommentReactionResponse> getCommentReactionListByCommentId(Long commentId);

    ListResponse<CommentReactionResponse> getCommentReactionListByUserId(Long userId);

    CommentReactionResponse getCommentReaction(Long commentId, Long userId);

    CommentReactionResponse saveCommentReaction(CommentReactionRequest request);

    void deleteCommentReaction(Long commentId, Long userId);
}
