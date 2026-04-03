package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.PostTagEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostTagMapper {

    List<PostTagEntity> getPostTagListByPostId(@Param("postId") Long postId);

    List<PostTagEntity> getPostTagListByTagId(@Param("tagId") Long tagId);

    int insertPostTag(PostTagEntity entity);

    int deletePostTag(@Param("postId") Long postId,
                      @Param("tagId") Long tagId);

    int deleteAllPostTagByPostId(@Param("postId") Long postId);
}
