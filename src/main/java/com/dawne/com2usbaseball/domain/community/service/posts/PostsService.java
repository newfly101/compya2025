package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.common.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.PostListResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;
import org.apache.ibatis.javassist.NotFoundException;

public interface PostsService {

    PostListResponse selectAllPostLists();
    OperationResponse<CommunityMessages> createNewPostItem(PostsEntity postsEntity);
    OperationResponse<CommunityMessages> updatePostItem(PostsEntity postsEntity);
    PostListResponse selectPostListsByBoard(Long boardId) throws NotFoundException;
}
