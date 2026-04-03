package com.dawne.com2usbaseball.domain.community.service.report;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.ReportMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.ReportRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.ReportResponse;
import com.dawne.com2usbaseball.domain.community.entity.CommentEntity;
import com.dawne.com2usbaseball.domain.community.entity.PostEntity;
import com.dawne.com2usbaseball.domain.community.entity.ReportEntity;
import com.dawne.com2usbaseball.domain.community.enums.ReportStatus;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.CommentRepository;
import com.dawne.com2usbaseball.domain.community.repository.PostRepository;
import com.dawne.com2usbaseball.domain.community.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReportMapStruct reportMapStruct;

    @Override
    public ReportResponse getReportByReporter(ReportTargetType targetType, Long targetId, Long reporterId) {
        ReportEntity entity = reportRepository.getReportByReporter(targetType, targetId, reporterId);
        if (entity == null) {
            throw new BaseException(CommunityMessages.COMMUNITY_REPORT_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return reportMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public ReportResponse createReport(ReportRequest request) {
        validateTarget(request.targetType(), request.targetId());

        ReportEntity existing = reportRepository.getReportByReporter(
                request.targetType(),
                request.targetId(),
                request.reporterId()
        );

        if (existing != null) {
            throw new BaseException(CommunityMessages.COMMUNITY_REPORT_ALREADY_EXISTS, HttpStatus.CONFLICT);
        }

        ReportEntity entity = reportMapStruct.toEntity(request);
        entity.setStatus(ReportStatus.PENDING);
        entity.setReviewedBy(null);
        entity.setReviewedAt(null);

        reportRepository.insertReport(entity);

        if (request.targetType() == ReportTargetType.POST) {
            postRepository.increasePostReportCount(request.targetId());
        }

        if (request.targetType() == ReportTargetType.COMMENT) {
            commentRepository.increaseCommentReportCount(request.targetId());
        }

        return reportMapStruct.toResponse(entity);
    }

    private void validateTarget(ReportTargetType targetType, Long targetId) {
        if (targetType == ReportTargetType.POST) {
            PostEntity postEntity = postRepository.getPostDetail(targetId);
            if (postEntity == null || Boolean.TRUE.equals(postEntity.getIsDeleted())) {
                throw new BaseException(CommunityMessages.COMMUNITY_REPORT_TARGET_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            return;
        }

        if (targetType == ReportTargetType.COMMENT) {
            CommentEntity commentEntity = commentRepository.getCommentDetail(targetId);
            if (commentEntity == null || Boolean.TRUE.equals(commentEntity.getIsDeleted())) {
                throw new BaseException(CommunityMessages.COMMUNITY_REPORT_TARGET_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
        }
    }
}
