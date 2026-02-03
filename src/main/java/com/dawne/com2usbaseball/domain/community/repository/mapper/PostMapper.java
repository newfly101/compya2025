package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostMapper {

    List<PostsEntity> selectPosts();

    int insertNewPost(PostsEntity posts);
    int updatePost(PostsEntity posts);

    List<PostsEntity> selectUserPosts(@Param("boardId") Long boardId);

}
