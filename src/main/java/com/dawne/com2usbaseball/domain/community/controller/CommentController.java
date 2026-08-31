package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.request.CommentRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentResponse;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.dawne.com2usbaseball.domain.community.service.comment.CommentService;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public CommentResponse createComment(@RequestBody CommentRequest request, HttpServletRequest httpRequest) {
        Long userId = requireUserId(httpRequest);
        UserRoleType role = isAdmin() ? UserRoleType.ADMIN : UserRoleType.USER;
        return commentService.createComment(request, userId, role);
    }

    @PutMapping("/{id}")
    public CommentResponse updateComment(@PathVariable Long id,
                                         @RequestBody CommentRequest request,
                                         HttpServletRequest httpRequest) {
        Long userId = requireUserId(httpRequest);
        return commentService.updateComment(id, request, userId);
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
    public void deleteComment(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long userId = requireUserId(httpRequest);
        commentService.deleteComment(id, userId, isAdmin());
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        return userId;
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if ("ROLE_ADMIN".equals(authority.getAuthority())) {
                return true;
            }
        }

        return false;
    }
}
