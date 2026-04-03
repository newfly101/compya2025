package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.PostReactionEntity;
import com.dawne.com2usbaseball.domain.community.repository.mapper.PostReactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostReactionRepository {

    private final PostReactionMapper postReactionMapper;

    public List<PostReactionEntity> getPostReactionListByPostId(Long postId) {
        return postReactionMapper.getPostReactionListByPostId(postId);
    }

    public List<PostReactionEntity> getPostReactionListByUserId(Long userId) {
        return postReactionMapper.getPostReactionListByUserId(userId);
    }

    public PostReactionEntity getPostReaction(Long postId, Long userId) {
        return postReactionMapper.getPostReaction(postId, userId);
    }

    public int insertPostReaction(PostReactionEntity entity) {
        return postReactionMapper.insertPostReaction(entity);
    }

    public int updatePostReaction(PostReactionEntity entity) {
        return postReactionMapper.updatePostReaction(entity);
    }

    public int deletePostReaction(Long postId, Long userId) {
        return postReactionMapper.deletePostReaction(postId, userId);
    }
}
