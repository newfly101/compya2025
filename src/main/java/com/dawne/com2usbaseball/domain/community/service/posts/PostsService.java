package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.PostResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;
import org.apache.ibatis.javassist.NotFoundException;

public interface PostsService {

    ListResponse<PostResponse> selectAllPostLists();
    OperationResponse<CommunityMessages> createNewPostItem(PostsEntity postsEntity);
    OperationResponse<CommunityMessages> updatePostItem(PostsEntity postsEntity);
    ListResponse<PostResponse> selectPostListsByBoard(Long boardId) throws NotFoundException;
}
