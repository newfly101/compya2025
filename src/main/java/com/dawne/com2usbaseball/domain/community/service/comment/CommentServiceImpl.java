package com.dawne.com2usbaseball.domain.community.service.comment;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.CommentMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.CommentRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentResponse;
import com.dawne.com2usbaseball.domain.community.entity.CommentEntity;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.CommentRepository;
import com.dawne.com2usbaseball.domain.community.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final CommentMapStruct commentMapStruct;

    @Override
    public ListResponse<CommentResponse> getCommentListByPostId(Long postId) {
        List<CommentEntity> commentList = commentRepository.getCommentListByPostId(postId);
        return ListAssembler.assemble(commentList, commentMapStruct::toResponse);
    }

    @Override
    public ListResponse<CommentResponse> getReplyListByParentCommentId(Long parentCommentId) {
        List<CommentEntity> replyList = commentRepository.getReplyListByParentCommentId(parentCommentId);
        return ListAssembler.assemble(replyList, commentMapStruct::toResponse);
    }

    @Override
    public CommentResponse getCommentDetail(Long id) {
        CommentEntity entity = getCommentEntity(id);
        return commentMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public CommentResponse createComment(CommentRequest request, Long authorId, UserRoleType authorRole) {
        CommentEntity entity = commentMapStruct.toEntity(request);

        entity.setAuthorId(authorId);
        entity.setUserRoleType(authorRole);

        if (entity.getIsVisible() == null) {
            entity.setIsVisible(true);
        }

        entity.setIsDeleted(false);
        entity.setLikeCount(0);
        entity.setDislikeCount(0);
        entity.setReportCount(0);

        commentRepository.insertComment(entity);

        if (entity.getPostId() != null) {
            postRepository.increasePostCommentCount(entity.getPostId());
        }

        return commentMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public CommentResponse updateComment(Long id, CommentRequest request, Long userId) {
        CommentEntity entity = getCommentEntity(id);
        requireOwner(entity, userId);
        commentMapStruct.updateFromRequest(request, entity);
        commentRepository.updateComment(entity);
        return commentMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public void increaseCommentLikeCount(Long id) {
        getCommentEntity(id);
        commentRepository.increaseCommentLikeCount(id);
    }

    @Override
    @Transactional
    public void decreaseCommentLikeCount(Long id) {
        getCommentEntity(id);
        commentRepository.decreaseCommentLikeCount(id);
    }

    @Override
    @Transactional
    public void increaseCommentDislikeCount(Long id) {
        getCommentEntity(id);
        commentRepository.increaseCommentDislikeCount(id);
    }

    @Override
    @Transactional
    public void decreaseCommentDislikeCount(Long id) {
        getCommentEntity(id);
        commentRepository.decreaseCommentDislikeCount(id);
    }

    @Override
    @Transactional
    public void increaseCommentReportCount(Long id) {
        getCommentEntity(id);
        commentRepository.increaseCommentReportCount(id);
    }

    @Override
    @Transactional
    public void deleteComment(Long id, Long userId, boolean isAdmin) {
        CommentEntity entity = getCommentEntity(id);

        if (!isAdmin) {
            requireOwner(entity, userId);
        }

        commentRepository.deleteComment(id);

        if (entity.getPostId() != null) {
            postRepository.decreasePostCommentCount(entity.getPostId());
        }
    }

    private CommentEntity getCommentEntity(Long id) {
        CommentEntity entity = commentRepository.getCommentDetail(id);
        if (entity == null || Boolean.TRUE.equals(entity.getIsDeleted())) {
            throw new BaseException(CommunityMessages.COMMUNITY_COMMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return entity;
    }

    // 댓글 수정/삭제는 작성자 본인만 가능 (삭제는 컨트롤러에서 ADMIN 예외 처리 후 호출)
    private void requireOwner(CommentEntity entity, Long userId) {
        if (userId == null || !userId.equals(entity.getAuthorId())) {
            throw new BaseException(CommunityMessages.COMMUNITY_COMMENT_FORBIDDEN, HttpStatus.FORBIDDEN);
        }
    }
}
