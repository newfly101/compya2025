package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.PostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.request.ReplacePostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostTagResponse;
import com.dawne.com2usbaseball.domain.community.service.posts.PostTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/post-tags")
public class PostTagController {

    private final PostTagService postTagService;

    @GetMapping("/posts/{postId}")
    public ListResponse<PostTagResponse> getPostTagListByPostId(@PathVariable Long postId) {
        return postTagService.getPostTagListByPostId(postId);
    }

    @GetMapping("/tags/{tagId}")
    public ListResponse<PostTagResponse> getPostTagListByTagId(@PathVariable Long tagId) {
        return postTagService.getPostTagListByTagId(tagId);
    }

    @PostMapping
    public PostTagResponse createPostTag(@RequestBody PostTagRequest request) {
        return postTagService.createPostTag(request);
    }

    @DeleteMapping
    public void deletePostTag(@RequestParam Long postId,
                              @RequestParam Long tagId) {
        postTagService.deletePostTag(postId, tagId);
    }

    @PutMapping("/replace")
    public void replacePostTags(@RequestBody ReplacePostTagRequest request) {
        postTagService.replacePostTags(request);
    }
}
