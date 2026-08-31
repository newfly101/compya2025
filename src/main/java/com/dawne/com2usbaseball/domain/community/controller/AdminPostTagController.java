package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.domain.community.dto.request.PostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.request.ReplacePostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostTagResponse;
import com.dawne.com2usbaseball.domain.community.service.posts.AdminPostTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/post-tags")
public class AdminPostTagController {

    private final AdminPostTagService adminPostTagService;

    @PostMapping
    public PostTagResponse createPostTag(@RequestBody PostTagRequest request) {
        return adminPostTagService.createPostTag(request);
    }

    @DeleteMapping
    public void deletePostTag(@RequestParam Long postId,
                              @RequestParam Long tagId) {
        adminPostTagService.deletePostTag(postId, tagId);
    }

    @PutMapping("/replace")
    public void replacePostTags(@RequestBody ReplacePostTagRequest request) {
        adminPostTagService.replacePostTags(request);
    }
}
