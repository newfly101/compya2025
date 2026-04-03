package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.CommentReactionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommentReactionMapper {

    List<CommentReactionEntity> getCommentReactionListByCommentId(@Param("commentId") Long commentId);

    List<CommentReactionEntity> getCommentReactionListByUserId(@Param("userId") Long userId);

    CommentReactionEntity getCommentReaction(@Param("commentId") Long commentId,
                                             @Param("userId") Long userId);

    int insertCommentReaction(CommentReactionEntity entity);

    int updateCommentReaction(CommentReactionEntity entity);

    int deleteCommentReaction(@Param("commentId") Long commentId,
                              @Param("userId") Long userId);
}
