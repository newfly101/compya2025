package com.dawne.com2usbaseball.domain.community.service.reaction;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.PostReactionMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.PostReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostReactionResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostEntity;
import com.dawne.com2usbaseball.domain.community.entity.PostReactionEntity;
import com.dawne.com2usbaseball.domain.community.enums.ReactionType;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.PostReactionRepository;
import com.dawne.com2usbaseball.domain.community.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostReactionServiceImpl implements PostReactionService {

    private final PostReactionRepository postReactionRepository;
    private final PostRepository postRepository;
    private final PostReactionMapStruct postReactionMapStruct;

    @Override
    public ListResponse<PostReactionResponse> getPostReactionListByPostId(Long postId) {
        List<PostReactionEntity> reactionList = postReactionRepository.getPostReactionListByPostId(postId);
        return ListAssembler.assemble(reactionList, postReactionMapStruct::toResponse);
    }

    @Override
    public ListResponse<PostReactionResponse> getPostReactionListByUserId(Long userId) {
        List<PostReactionEntity> reactionList = postReactionRepository.getPostReactionListByUserId(userId);
        return ListAssembler.assemble(reactionList, postReactionMapStruct::toResponse);
    }

    @Override
    public PostReactionResponse getPostReaction(Long postId, Long userId) {
        PostReactionEntity entity = postReactionRepository.getPostReaction(postId, userId);
        if (entity == null) {
            throw new BaseException(CommunityMessages.COMMUNITY_POST_REACTION_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return postReactionMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public PostReactionResponse savePostReaction(PostReactionRequest request) {
        PostEntity postEntity = postRepository.getPostDetail(request.postId());
        if (postEntity == null || Boolean.TRUE.equals(postEntity.getIsDeleted())) {
            throw new BaseException(CommunityMessages.COMMUNITY_POST_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        PostReactionEntity existing = postReactionRepository.getPostReaction(
                request.postId(),
                request.userId()
        );

        if (existing == null) {
            PostReactionEntity entity = postReactionMapStruct.toEntity(request);
            postReactionRepository.insertPostReaction(entity);
            applyIncreaseCount(request.reaction(), request.postId());
            return postReactionMapStruct.toResponse(entity);
        }

        if (existing.getReaction() == request.reaction()) {
            return postReactionMapStruct.toResponse(existing);
        }

        applyDecreaseCount(existing.getReaction(), existing.getPostId());

        existing.setReaction(request.reaction());
        postReactionRepository.updatePostReaction(existing);

        applyIncreaseCount(existing.getReaction(), existing.getPostId());

        return postReactionMapStruct.toResponse(existing);
    }

    @Override
    @Transactional
    public void deletePostReaction(Long postId, Long userId) {
        PostReactionEntity existing = postReactionRepository.getPostReaction(postId, userId);
        if (existing == null) {
            throw new BaseException(CommunityMessages.COMMUNITY_POST_REACTION_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        postReactionRepository.deletePostReaction(postId, userId);
        applyDecreaseCount(existing.getReaction(), existing.getPostId());
    }

    private void applyIncreaseCount(ReactionType reactionType, Long postId) {
        if (reactionType == ReactionType.LIKE) {
            postRepository.increasePostLikeCount(postId);
            return;
        }

        if (reactionType == ReactionType.DISLIKE) {
            postRepository.increasePostDislikeCount(postId);
        }
    }

    private void applyDecreaseCount(ReactionType reactionType, Long postId) {
        if (reactionType == ReactionType.LIKE) {
            postRepository.decreasePostLikeCount(postId);
            return;
        }

        if (reactionType == ReactionType.DISLIKE) {
            postRepository.decreasePostDislikeCount(postId);
        }
    }
}
