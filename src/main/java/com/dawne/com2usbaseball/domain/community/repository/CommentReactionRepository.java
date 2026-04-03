package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.CommentReactionEntity;
import com.dawne.com2usbaseball.domain.community.repository.mapper.CommentReactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CommentReactionRepository {

    private final CommentReactionMapper commentReactionMapper;

    public List<CommentReactionEntity> getCommentReactionListByCommentId(Long commentId) {
        return commentReactionMapper.getCommentReactionListByCommentId(commentId);
    }

    public List<CommentReactionEntity> getCommentReactionListByUserId(Long userId) {
        return commentReactionMapper.getCommentReactionListByUserId(userId);
    }

    public CommentReactionEntity getCommentReaction(Long commentId, Long userId) {
        return commentReactionMapper.getCommentReaction(commentId, userId);
    }

    public boolean insertCommentReaction(CommentReactionEntity entity) {
        return commentReactionMapper.insertCommentReaction(entity) > 0;
    }

    public boolean updateCommentReaction(CommentReactionEntity entity) {
        return commentReactionMapper.updateCommentReaction(entity) > 0;
    }

    public boolean deleteCommentReaction(Long commentId, Long userId) {
        return commentReactionMapper.deleteCommentReaction(commentId, userId) > 0;
    }
}
