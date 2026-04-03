package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.CommentEntity;
import com.dawne.com2usbaseball.domain.community.repository.mapper.CommentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CommentRepository {

    private final CommentMapper commentMapper;

    public List<CommentEntity> getCommentListByPostId(Long postId) {
        return commentMapper.getCommentListByPostId(postId);
    }

    public List<CommentEntity> getReplyListByParentCommentId(Long parentCommentId) {
        return commentMapper.getReplyListByParentCommentId(parentCommentId);
    }

    public CommentEntity getCommentDetail(Long id) {
        return commentMapper.getCommentDetail(id);
    }

    public boolean countCommentByPostId(Long postId) {
        return commentMapper.countCommentByPostId(postId) > 0;
    }

    public boolean insertComment(CommentEntity entity) {
        return commentMapper.insertComment(entity) > 0;
    }

    public boolean updateComment(CommentEntity entity) {
        return commentMapper.updateComment(entity) > 0;
    }

    public boolean updateCommentVisible(Long id, Boolean isVisible) {
        return commentMapper.updateCommentVisible(id, isVisible) > 0;
    }

    public boolean increaseCommentLikeCount(Long id) {
        return commentMapper.increaseCommentLikeCount(id) > 0;
    }

    public boolean decreaseCommentLikeCount(Long id) {
        return commentMapper.decreaseCommentLikeCount(id) > 0;
    }

    public boolean increaseCommentDislikeCount(Long id) {
        return commentMapper.increaseCommentDislikeCount(id) > 0;
    }

    public boolean decreaseCommentDislikeCount(Long id) {
        return commentMapper.decreaseCommentDislikeCount(id) > 0;
    }

    public boolean increaseCommentReportCount(Long id) {
        return commentMapper.increaseCommentReportCount(id) > 0;
    }

    public boolean deleteComment(Long id) {
        return commentMapper.deleteComment(id) > 0;
    }
}
