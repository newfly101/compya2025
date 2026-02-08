package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.PostsChangeRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostResponse;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.service.posts.PostsService;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.javassist.NotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community")
public class PostsController {

    private final PostsService postsService;

    @GetMapping("/admin/posts")
    public ListResponse<PostResponse> getAllPostList() {
         return postsService.selectAllPostLists();
    }

    @PostMapping("/admin/posts")
    public OperationResponse<CommunityMessages> createNewPost(@RequestBody PostsChangeRequest request) {
        return postsService.createNewPostItem(request.toEntity());
    }
    @PatchMapping("/admin/posts/{id}")
    public OperationResponse<CommunityMessages> updatePost(@RequestBody PostsChangeRequest request, @PathVariable Long id) {
        return postsService.updatePostItem(request.toEntity(id));
    }

    @GetMapping("/board/{boardId}/posts")
    public ListResponse<PostResponse> getPostListByBoardId(@PathVariable Long boardId) throws NotFoundException {
        return postsService.selectPostListsByBoard(boardId);
    }



}
