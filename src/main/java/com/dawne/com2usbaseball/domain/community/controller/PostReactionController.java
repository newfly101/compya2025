package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.PostReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostReactionResponse;
import com.dawne.com2usbaseball.domain.community.service.reaction.PostReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/post-reactions")
public class PostReactionController {

    private final PostReactionService postReactionService;

    @GetMapping("/posts/{postId}")
    public ListResponse<PostReactionResponse> getPostReactionListByPostId(@PathVariable Long postId) {
        return postReactionService.getPostReactionListByPostId(postId);
    }

    @GetMapping("/users/{userId}")
    public ListResponse<PostReactionResponse> getPostReactionListByUserId(@PathVariable Long userId) {
        return postReactionService.getPostReactionListByUserId(userId);
    }

    @GetMapping
    public PostReactionResponse getPostReaction(@RequestParam Long postId,
                                                @RequestParam Long userId) {
        return postReactionService.getPostReaction(postId, userId);
    }

    @PostMapping
    public PostReactionResponse savePostReaction(@RequestBody PostReactionRequest request) {
        return postReactionService.savePostReaction(request);
    }

    @DeleteMapping
    public void deletePostReaction(@RequestParam Long postId,
                                   @RequestParam Long userId) {
        postReactionService.deletePostReaction(postId, userId);
    }
}
