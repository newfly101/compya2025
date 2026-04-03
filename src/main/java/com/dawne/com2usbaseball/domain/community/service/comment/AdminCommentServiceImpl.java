package com.dawne.com2usbaseball.domain.community.service.comment;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.CommentMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.ChangeCommentVisibleRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentResponse;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.entity.CommentEntity;
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
public class AdminCommentServiceImpl implements AdminCommentService {

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
    public void updateCommentVisible(Long id, ChangeCommentVisibleRequest request) {
        getCommentEntity(id);
        commentRepository.updateCommentVisible(id, request.getIsVisible());
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        CommentEntity entity = getCommentEntity(id);
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
}
