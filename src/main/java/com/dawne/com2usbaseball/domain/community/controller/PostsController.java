package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.domain.community.dto.request.PostsChangeRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.InsertPostsResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.PostListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.UpdatePostsResponse;
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
    public PostListResponse getAllPostList() {
         return postsService.selectAllPostLists();
    }

    @PostMapping("/admin/posts")
    public InsertPostsResponse createNewPost(@RequestBody PostsChangeRequest request) {
        return postsService.createNewPostItem(request.toEntity());
    }
    @PatchMapping("/admin/posts/{id}")
    public UpdatePostsResponse updatePost(@RequestBody PostsChangeRequest request, @PathVariable Long id) {
        return postsService.updatePostItem(request.toEntity(id));
    }

    @GetMapping("/board/{boardId}/posts")
    public PostListResponse getPostListByBoardId(@PathVariable Long boardId) throws NotFoundException {
        return postsService.selectPostListsByBoard(boardId);
    }



}
