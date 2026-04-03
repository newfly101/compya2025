package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.domain.community.entity.PostEntity;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;

import java.util.List;

public interface PostService {

    List<PostEntity> getPostListByBoardId(Long boardId);

    List<PostEntity> getPinnedPostListByBoardId(Long boardId);

    List<PostEntity> getPopularPostListByBoardId(Long boardId);

    List<PostEntity> getPostListByAuthor(UserRoleType userRoleType, Long authorId);

    PostEntity getPostDetail(Long id);

    PostEntity getPostDetailAndIncreaseViewCount(Long id);

    Long createPost(PostEntity entity);

    void updatePost(Long id, PostEntity entity);

    void updatePostVisible(Long id, Boolean isVisible);

    void updatePostPinned(Long id, Boolean isPinned);

    void increasePostCommentCount(Long id);

    void decreasePostCommentCount(Long id);

    void increasePostLikeCount(Long id);

    void decreasePostLikeCount(Long id);

    void increasePostDislikeCount(Long id);

    void decreasePostDislikeCount(Long id);

    void increasePostReportCount(Long id);

    void deletePost(Long id);
}
