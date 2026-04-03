package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.domain.community.dto.mapstruct.PostMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.PostRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostEntity;
import com.dawne.com2usbaseball.domain.community.service.posts.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/posts")
public class AdminPostController {

    private final PostService postService;
    private final PostMapStruct postMapStruct;

    @GetMapping("/{id}")
    public PostResponse getPostDetail(@PathVariable Long id) {
        return postMapStruct.toResponse(postService.getPostDetail(id));
    }

    @PostMapping
    public Long createPost(@RequestBody PostRequest request) {
        PostEntity entity = postMapStruct.toEntity(request);
        return postService.createPost(entity);
    }

    @PutMapping("/{id}")
    public void updatePost(@PathVariable Long id,
                           @RequestBody PostRequest request) {
        PostEntity entity = postMapStruct.toEntity(request);
        postService.updatePost(id, entity);
    }

    @PatchMapping("/{id}/visible")
    public void updatePostVisible(@PathVariable Long id,
                                  @RequestParam Boolean isVisible) {
        postService.updatePostVisible(id, isVisible);
    }

    @PatchMapping("/{id}/pinned")
    public void updatePostPinned(@PathVariable Long id,
                                 @RequestParam Boolean isPinned) {
        postService.updatePostPinned(id, isPinned);
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Long id) {
        postService.deletePost(id);
    }
}
