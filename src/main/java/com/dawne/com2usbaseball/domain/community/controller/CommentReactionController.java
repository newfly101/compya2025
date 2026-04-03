package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.CommentReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentReactionResponse;
import com.dawne.com2usbaseball.domain.community.service.reaction.CommentReactionService;
import lombok.RequiredArgsConstructor;
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
    public CommentReactionResponse saveCommentReaction(@RequestBody CommentReactionRequest request) {
        return commentReactionService.saveCommentReaction(request);
    }

    @DeleteMapping
    public void deleteCommentReaction(@RequestParam Long commentId,
                                      @RequestParam Long userId) {
        commentReactionService.deleteCommentReaction(commentId, userId);
    }
}
