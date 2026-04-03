package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.PostEntity;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.dawne.com2usbaseball.domain.community.repository.mapper.PostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostRepository {

    private final PostMapper postMapper;

    public List<PostEntity> getPostListByBoardId(Long boardId) {
        return postMapper.getPostListByBoardId(boardId);
    }

    public List<PostEntity> getPinnedPostListByBoardId(Long boardId) {
        return postMapper.getPinnedPostListByBoardId(boardId);
    }

    public List<PostEntity> getPopularPostListByBoardId(Long boardId) {
        return postMapper.getPopularPostListByBoardId(boardId);
    }

    public List<PostEntity> getPostListByAuthor(UserRoleType userRoleType, Long authorId) {
        return postMapper.getPostListByAuthor(userRoleType, authorId);
    }

    public PostEntity getPostDetail(Long id) {
        return postMapper.getPostDetail(id);
    }

    public int insertPost(PostEntity entity) {
        return postMapper.insertPost(entity);
    }

    public int updatePost(PostEntity entity) {
        return postMapper.updatePost(entity);
    }

    public int updatePostVisible(Long id, Boolean isVisible) {
        return postMapper.updatePostVisible(id, isVisible);
    }

    public int updatePostPinned(Long id, Boolean isPinned) {
        return postMapper.updatePostPinned(id, isPinned);
    }

    public int increasePostViewCount(Long id) {
        return postMapper.increasePostViewCount(id);
    }

    public int increasePostCommentCount(Long id) {
        return postMapper.increasePostCommentCount(id);
    }

    public int decreasePostCommentCount(Long id) {
        return postMapper.decreasePostCommentCount(id);
    }

    public int increasePostLikeCount(Long id) {
        return postMapper.increasePostLikeCount(id);
    }

    public int decreasePostLikeCount(Long id) {
        return postMapper.decreasePostLikeCount(id);
    }

    public int increasePostDislikeCount(Long id) {
        return postMapper.increasePostDislikeCount(id);
    }

    public int decreasePostDislikeCount(Long id) {
        return postMapper.decreasePostDislikeCount(id);
    }

    public int increasePostReportCount(Long id) {
        return postMapper.increasePostReportCount(id);
    }

    public int deletePost(Long id) {
        return postMapper.deletePost(id);
    }
}
