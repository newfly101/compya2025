package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.domain.community.entity.PostEntity;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.dawne.com2usbaseball.domain.community.exception.CommunityException;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;

    @Override
    public List<PostEntity> getPostListByBoardId(Long boardId) {
        return postRepository.getPostListByBoardId(boardId);
    }

    @Override
    public List<PostEntity> getPinnedPostListByBoardId(Long boardId) {
        return postRepository.getPinnedPostListByBoardId(boardId);
    }

    @Override
    public List<PostEntity> getPopularPostListByBoardId(Long boardId) {
        return postRepository.getPopularPostListByBoardId(boardId);
    }

    @Override
    public List<PostEntity> getPostListByAuthor(UserRoleType userRoleType, Long authorId) {
        return postRepository.getPostListByAuthor(userRoleType, authorId);
    }

    @Override
    public PostEntity getPostDetail(Long id) {
        PostEntity post = postRepository.getPostDetail(id);
        if (post == null) {
            throw new CommunityException(CommunityMessages.COMMUNITY_POST_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return post;
    }

    @Override
    @Transactional
    public PostEntity getPostDetailAndIncreaseViewCount(Long id) {
        getPostDetail(id);
        postRepository.increasePostViewCount(id);
        return getPostDetail(id);
    }

    @Override
    @Transactional
    public Long createPost(PostEntity entity) {
        if (entity.getIsPinned() == null) {
            entity.setIsPinned(false);
        }
        if (entity.getIsVisible() == null) {
            entity.setIsVisible(true);
        }
        if (entity.getIsDeleted() == null) {
            entity.setIsDeleted(false);
        }
        if (entity.getViewCount() == null) {
            entity.setViewCount(0);
        }
        if (entity.getCommentCount() == null) {
            entity.setCommentCount(0);
        }
        if (entity.getLikeCount() == null) {
            entity.setLikeCount(0);
        }
        if (entity.getDislikeCount() == null) {
            entity.setDislikeCount(0);
        }
        if (entity.getReportCount() == null) {
            entity.setReportCount(0);
        }

        postRepository.insertPost(entity);
        return entity.getId();
    }

    @Override
    @Transactional
    public void updatePost(Long id, PostEntity entity) {
        PostEntity current = getPostDetail(id);

        current.setTitle(entity.getTitle());
        current.setContent(entity.getContent());
        current.setLinkType(entity.getLinkType());
        current.setExternalUrl(entity.getExternalUrl());
        current.setIsPinned(entity.getIsPinned());
        current.setIsVisible(entity.getIsVisible());

        postRepository.updatePost(current);
    }

    @Override
    @Transactional
    public void updatePostVisible(Long id, Boolean isVisible) {
        getPostDetail(id);
        postRepository.updatePostVisible(id, isVisible);
    }

    @Override
    @Transactional
    public void updatePostPinned(Long id, Boolean isPinned) {
        getPostDetail(id);
        postRepository.updatePostPinned(id, isPinned);
    }

    @Override
    @Transactional
    public void increasePostCommentCount(Long id) {
        getPostDetail(id);
        postRepository.increasePostCommentCount(id);
    }

    @Override
    @Transactional
    public void decreasePostCommentCount(Long id) {
        getPostDetail(id);
        postRepository.decreasePostCommentCount(id);
    }

    @Override
    @Transactional
    public void increasePostLikeCount(Long id) {
        getPostDetail(id);
        postRepository.increasePostLikeCount(id);
    }

    @Override
    @Transactional
    public void decreasePostLikeCount(Long id) {
        getPostDetail(id);
        postRepository.decreasePostLikeCount(id);
    }

    @Override
    @Transactional
    public void increasePostDislikeCount(Long id) {
        getPostDetail(id);
        postRepository.increasePostDislikeCount(id);
    }

    @Override
    @Transactional
    public void decreasePostDislikeCount(Long id) {
        getPostDetail(id);
        postRepository.decreasePostDislikeCount(id);
    }

    @Override
    @Transactional
    public void increasePostReportCount(Long id) {
        getPostDetail(id);
        postRepository.increasePostReportCount(id);
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        getPostDetail(id);
        postRepository.deletePost(id);
    }
}
