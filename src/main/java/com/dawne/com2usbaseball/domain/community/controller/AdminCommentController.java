package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.ChangeCommentVisibleRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentResponse;
import com.dawne.com2usbaseball.domain.community.service.comment.AdminCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/comments")
public class AdminCommentController {

    private final AdminCommentService adminCommentService;

    @GetMapping("/posts/{postId}")
    public ListResponse<CommentResponse> getCommentListByPostId(@PathVariable Long postId) {
        return adminCommentService.getCommentListByPostId(postId);
    }

    @GetMapping("/{id}")
    public CommentResponse getCommentDetail(@PathVariable Long id) {
        return adminCommentService.getCommentDetail(id);
    }

    @GetMapping("/{parentCommentId}/replies")
    public ListResponse<CommentResponse> getReplyListByParentCommentId(@PathVariable Long parentCommentId) {
        return adminCommentService.getReplyListByParentCommentId(parentCommentId);
    }

    @PatchMapping("/{id}/visible")
    public void updateCommentVisible(@PathVariable Long id,
                                     @RequestBody ChangeCommentVisibleRequest request) {
        adminCommentService.updateCommentVisible(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteComment(@PathVariable Long id) {
        adminCommentService.deleteComment(id);
    }
}
