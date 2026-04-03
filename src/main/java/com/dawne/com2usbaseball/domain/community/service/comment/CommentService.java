package com.dawne.com2usbaseball.domain.community.service.comment;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.CommentRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentResponse;

public interface CommentService {

    ListResponse<CommentResponse> getCommentListByPostId(Long postId);

    ListResponse<CommentResponse> getReplyListByParentCommentId(Long parentCommentId);

    CommentResponse getCommentDetail(Long id);

    CommentResponse createComment(CommentRequest request);

    CommentResponse updateComment(Long id, CommentRequest request);

    void increaseCommentLikeCount(Long id);

    void decreaseCommentLikeCount(Long id);

    void increaseCommentDislikeCount(Long id);

    void decreaseCommentDislikeCount(Long id);

    void increaseCommentReportCount(Long id);

    void deleteComment(Long id);
}
