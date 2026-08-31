package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.request.PostReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostReactionResponse;
import com.dawne.com2usbaseball.domain.community.service.reaction.PostReactionService;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public PostReactionResponse savePostReaction(@RequestBody PostReactionRequest request,
                                                 HttpServletRequest httpRequest) {
        Long userId = requireUserId(httpRequest);
        return postReactionService.savePostReaction(request, userId);
    }

    @DeleteMapping
    public void deletePostReaction(@RequestParam Long postId,
                                   HttpServletRequest httpRequest) {
        Long userId = requireUserId(httpRequest);
        postReactionService.deletePostReaction(postId, userId);
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        return userId;
    }
}
