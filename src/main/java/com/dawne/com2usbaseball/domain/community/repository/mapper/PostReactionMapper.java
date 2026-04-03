package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.PostReactionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostReactionMapper {

    List<PostReactionEntity> getPostReactionListByPostId(@Param("postId") Long postId);

    List<PostReactionEntity> getPostReactionListByUserId(@Param("userId") Long userId);

    PostReactionEntity getPostReaction(@Param("postId") Long postId,
                                       @Param("userId") Long userId);

    int insertPostReaction(PostReactionEntity entity);

    int updatePostReaction(PostReactionEntity entity);

    int deletePostReaction(@Param("postId") Long postId,
                           @Param("userId") Long userId);
}
