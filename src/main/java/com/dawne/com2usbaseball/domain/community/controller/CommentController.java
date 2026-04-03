package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.CommentRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentResponse;
import com.dawne.com2usbaseball.domain.community.service.comment.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{postId}")
    public ListResponse<CommentResponse> getCommentListByPostId(@PathVariable Long postId) {
        return commentService.getCommentListByPostId(postId);
    }

    @GetMapping("/{id}")
    public CommentResponse getCommentDetail(@PathVariable Long id) {
        return commentService.getCommentDetail(id);
    }

    @GetMapping("/{parentCommentId}/replies")
    public ListResponse<CommentResponse> getReplyListByParentCommentId(@PathVariable Long parentCommentId) {
        return commentService.getReplyListByParentCommentId(parentCommentId);
    }

    @PostMapping
    public CommentResponse createComment(@RequestBody CommentRequest request) {
        return commentService.createComment(request);
    }

    @PutMapping("/{id}")
    public CommentResponse updateComment(@PathVariable Long id,
                                         @RequestBody CommentRequest request) {
        return commentService.updateComment(id, request);
    }

    @PostMapping("/{id}/like")
    public void increaseCommentLikeCount(@PathVariable Long id) {
        commentService.increaseCommentLikeCount(id);
    }

    @DeleteMapping("/{id}/like")
    public void decreaseCommentLikeCount(@PathVariable Long id) {
        commentService.decreaseCommentLikeCount(id);
    }

    @PostMapping("/{id}/dislike")
    public void increaseCommentDislikeCount(@PathVariable Long id) {
        commentService.increaseCommentDislikeCount(id);
    }

    @DeleteMapping("/{id}/dislike")
    public void decreaseCommentDislikeCount(@PathVariable Long id) {
        commentService.decreaseCommentDislikeCount(id);
    }

    @PostMapping("/{id}/report")
    public void increaseCommentReportCount(@PathVariable Long id) {
        commentService.increaseCommentReportCount(id);
    }

    @DeleteMapping("/{id}")
    public void deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
    }
}
