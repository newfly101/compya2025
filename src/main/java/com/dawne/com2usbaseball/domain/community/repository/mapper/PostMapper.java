package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.PostEntity;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostMapper {

    List<PostEntity> getPostListByBoardId(@Param("boardId") Long boardId);

    List<PostEntity> getPinnedPostListByBoardId(@Param("boardId") Long boardId);

    List<PostEntity> getPopularPostListByBoardId(@Param("boardId") Long boardId);

    List<PostEntity> getPostListByAuthor(@Param("userRoleType") UserRoleType userRoleType,
                                         @Param("authorId") Long authorId);

    PostEntity getPostDetail(@Param("id") Long id);

    int insertPost(PostEntity entity);

    int updatePost(PostEntity entity);

    int updatePostVisible(@Param("id") Long id,
                          @Param("isVisible") Boolean isVisible);

    int updatePostPinned(@Param("id") Long id,
                         @Param("isPinned") Boolean isPinned);

    int increasePostViewCount(@Param("id") Long id);

    // 댓글 수
    int increasePostCommentCount(@Param("id") Long id);
    int decreasePostCommentCount(@Param("id") Long id);

    // 좋아요
    int increasePostLikeCount(@Param("id") Long id);
    int decreasePostLikeCount(@Param("id") Long id);

    // 싫어요
    int increasePostDislikeCount(@Param("id") Long id);
    int decreasePostDislikeCount(@Param("id") Long id);

    // 신고
    int increasePostReportCount(@Param("id") Long id);

    int deletePost(@Param("id") Long id);
}
