package com.dawne.com2usbaseball.domain.community.service.reaction;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.CommentReactionMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.CommentReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentReactionResponse;
import com.dawne.com2usbaseball.domain.community.entity.CommentReactionEntity;
import com.dawne.com2usbaseball.domain.community.entity.CommentEntity;
import com.dawne.com2usbaseball.domain.community.enums.ReactionType;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.CommentReactionRepository;
import com.dawne.com2usbaseball.domain.community.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentReactionServiceImpl implements CommentReactionService {

    private final CommentReactionRepository commentReactionRepository;
    private final CommentRepository commentRepository;
    private final CommentReactionMapStruct commentReactionMapStruct;

    @Override
    public ListResponse<CommentReactionResponse> getCommentReactionListByCommentId(Long commentId) {
        List<CommentReactionEntity> reactionList = commentReactionRepository.getCommentReactionListByCommentId(commentId);
        return ListAssembler.assemble(reactionList, commentReactionMapStruct::toResponse);
    }

    @Override
    public ListResponse<CommentReactionResponse> getCommentReactionListByUserId(Long userId) {
        List<CommentReactionEntity> reactionList = commentReactionRepository.getCommentReactionListByUserId(userId);
        return ListAssembler.assemble(reactionList, commentReactionMapStruct::toResponse);
    }

    @Override
    public CommentReactionResponse getCommentReaction(Long commentId, Long userId) {
        CommentReactionEntity entity = commentReactionRepository.getCommentReaction(commentId, userId);
        if (entity == null) {
            throw new BaseException(CommunityMessages.COMMUNITY_COMMENT_REACTION_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return commentReactionMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public CommentReactionResponse saveCommentReaction(CommentReactionRequest request) {
        CommentEntity commentEntity = commentRepository.getCommentDetail(request.commentId());
        if (commentEntity == null || Boolean.TRUE.equals(commentEntity.getIsDeleted())) {
            throw new BaseException(CommunityMessages.COMMUNITY_COMMENT_REACTION_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        CommentReactionEntity existing = commentReactionRepository.getCommentReaction(
                request.commentId(),
                request.userId()
        );

        if (existing == null) {
            CommentReactionEntity entity = commentReactionMapStruct.toEntity(request);
            commentReactionRepository.insertCommentReaction(entity);
            applyIncreaseCount(request.reaction(), request.commentId());
            return commentReactionMapStruct.toResponse(entity);
        }

        if (existing.getReaction() == request.reaction()) {
            return commentReactionMapStruct.toResponse(existing);
        }

        applyDecreaseCount(existing.getReaction(), existing.getCommentId());

        existing.setReaction(request.reaction());
        commentReactionRepository.updateCommentReaction(existing);

        applyIncreaseCount(existing.getReaction(), existing.getCommentId());

        return commentReactionMapStruct.toResponse(existing);
    }

    @Override
    @Transactional
    public void deleteCommentReaction(Long commentId, Long userId) {
        CommentReactionEntity existing = commentReactionRepository.getCommentReaction(commentId, userId);
        if (existing == null) {
            throw new BaseException(CommunityMessages.COMMUNITY_COMMENT_REACTION_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        commentReactionRepository.deleteCommentReaction(commentId, userId);
        applyDecreaseCount(existing.getReaction(), existing.getCommentId());
    }

    private void applyIncreaseCount(ReactionType reactionType, Long commentId) {
        if (reactionType == ReactionType.LIKE) {
            commentRepository.increaseCommentLikeCount(commentId);
            return;
        }

        if (reactionType == ReactionType.DISLIKE) {
            commentRepository.increaseCommentDislikeCount(commentId);
        }
    }

    private void applyDecreaseCount(ReactionType reactionType, Long commentId) {
        if (reactionType == ReactionType.LIKE) {
            commentRepository.decreaseCommentLikeCount(commentId);
            return;
        }

        if (reactionType == ReactionType.DISLIKE) {
            commentRepository.decreaseCommentDislikeCount(commentId);
        }
    }
}
