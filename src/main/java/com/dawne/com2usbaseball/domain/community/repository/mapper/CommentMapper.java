package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.CommentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommentMapper {

    List<CommentEntity> getCommentListByPostId(@Param("postId") Long postId);

    List<CommentEntity> getReplyListByParentCommentId(@Param("parentCommentId") Long parentCommentId);

    CommentEntity getCommentDetail(@Param("id") Long id);

    int countCommentByPostId(@Param("postId") Long postId);

    int insertComment(CommentEntity entity);

    int updateComment(CommentEntity entity);

    int updateCommentVisible(@Param("id") Long id,
                             @Param("isVisible") Boolean isVisible);

    // 좋아요
    int increaseCommentLikeCount(@Param("id") Long id);
    int decreaseCommentLikeCount(@Param("id") Long id);

    // 싫어요
    int increaseCommentDislikeCount(@Param("id") Long id);
    int decreaseCommentDislikeCount(@Param("id") Long id);

    // 신고
    int increaseCommentReportCount(@Param("id") Long id);

    int deleteComment(@Param("id") Long id);
}
