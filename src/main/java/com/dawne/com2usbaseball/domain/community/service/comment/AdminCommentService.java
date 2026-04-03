package com.dawne.com2usbaseball.domain.community.service.comment;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.ChangeCommentVisibleRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentResponse;

public interface AdminCommentService {

    ListResponse<CommentResponse> getCommentListByPostId(Long postId);

    ListResponse<CommentResponse> getReplyListByParentCommentId(Long parentCommentId);

    CommentResponse getCommentDetail(Long id);

    void updateCommentVisible(Long id, ChangeCommentVisibleRequest request);

    void deleteComment(Long id);
}
