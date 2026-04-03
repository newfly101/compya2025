package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.domain.community.dto.mapstruct.PostMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.response.PostResponse;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.dawne.com2usbaseball.domain.community.service.posts.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final PostMapStruct postMapStruct;

    @GetMapping("/boards/{boardId}")
    public List<PostResponse> getPostListByBoardId(@PathVariable Long boardId) {
        return postService.getPostListByBoardId(boardId)
                .stream()
                .map(postMapStruct::toResponse)
                .toList();
    }

    @GetMapping("/boards/{boardId}/pinned")
    public List<PostResponse> getPinnedPostListByBoardId(@PathVariable Long boardId) {
        return postService.getPinnedPostListByBoardId(boardId)
                .stream()
                .map(postMapStruct::toResponse)
                .toList();
    }

    @GetMapping("/boards/{boardId}/popular")
    public List<PostResponse> getPopularPostListByBoardId(@PathVariable Long boardId) {
        return postService.getPopularPostListByBoardId(boardId)
                .stream()
                .map(postMapStruct::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public PostResponse getPostDetail(@PathVariable Long id) {
        return postMapStruct.toResponse(postService.getPostDetailAndIncreaseViewCount(id));
    }

    @GetMapping("/authors")
    public List<PostResponse> getPostListByAuthor(@RequestParam UserRoleType userRoleType,
                                                  @RequestParam Long authorId) {
        return postService.getPostListByAuthor(userRoleType, authorId)
                .stream()
                .map(postMapStruct::toResponse)
                .toList();
    }
}
