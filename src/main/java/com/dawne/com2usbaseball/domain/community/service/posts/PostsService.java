package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.domain.community.dto.response.posts.InsertPostsResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.PostListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.UpdatePostsResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import org.apache.ibatis.javassist.NotFoundException;

public interface PostsService {

    PostListResponse selectAllPostLists();
    InsertPostsResponse createNewPostItem(PostsEntity postsEntity);
    UpdatePostsResponse updatePostItem(PostsEntity postsEntity);
    PostListResponse selectPostListsByBoard(Long boardId) throws NotFoundException;
}
