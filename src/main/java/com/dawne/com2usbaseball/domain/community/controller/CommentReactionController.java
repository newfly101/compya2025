package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.request.CommentReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentReactionResponse;
import com.dawne.com2usbaseball.domain.community.service.reaction.CommentReactionService;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comment-reactions")
public class CommentReactionController {

    private final CommentReactionService commentReactionService;

    @GetMapping("/comments/{commentId}")
    public ListResponse<CommentReactionResponse> getCommentReactionListByCommentId(@PathVariable Long commentId) {
        return commentReactionService.getCommentReactionListByCommentId(commentId);
    }

    @GetMapping("/users/{userId}")
    public ListResponse<CommentReactionResponse> getCommentReactionListByUserId(@PathVariable Long userId) {
        return commentReactionService.getCommentReactionListByUserId(userId);
    }

    @GetMapping
    public CommentReactionResponse getCommentReaction(@RequestParam Long commentId,
                                                      @RequestParam Long userId) {
        return commentReactionService.getCommentReaction(commentId, userId);
    }

    @PostMapping
    public CommentReactionResponse saveCommentReaction(@RequestBody CommentReactionRequest request,
                                                        HttpServletRequest httpRequest) {
        Long userId = requireUserId(httpRequest);
        return commentReactionService.saveCommentReaction(request, userId);
    }

    @DeleteMapping
    public void deleteCommentReaction(@RequestParam Long commentId,
                                      HttpServletRequest httpRequest) {
        Long userId = requireUserId(httpRequest);
        commentReactionService.deleteCommentReaction(commentId, userId);
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        return userId;
    }
}
