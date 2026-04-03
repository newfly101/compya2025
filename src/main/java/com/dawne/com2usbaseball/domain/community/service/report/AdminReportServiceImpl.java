package com.dawne.com2usbaseball.domain.community.service.report;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.ReportMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.ChangeReportStatusRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.ReportResponse;
import com.dawne.com2usbaseball.domain.community.entity.ReportEntity;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportServiceImpl implements AdminReportService {

    private final ReportRepository reportRepository;
    private final ReportMapStruct reportMapStruct;

    @Override
    public ListResponse<ReportResponse> getReportList() {
        List<ReportEntity> reportList = reportRepository.getReportList();
        return ListAssembler.assemble(reportList, reportMapStruct::toResponse);
    }

    @Override
    public ListResponse<ReportResponse> getPendingReportList() {
        List<ReportEntity> reportList = reportRepository.getPendingReportList();
        return ListAssembler.assemble(reportList, reportMapStruct::toResponse);
    }

    @Override
    public ListResponse<ReportResponse> getReportListByTarget(ReportTargetType targetType, Long targetId) {
        List<ReportEntity> reportList = reportRepository.getReportListByTarget(targetType, targetId);
        return ListAssembler.assemble(reportList, reportMapStruct::toResponse);
    }

    @Override
    public ReportResponse getReportDetail(Long id) {
        ReportEntity entity = getReportEntity(id);
        return reportMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public void updateReportStatus(Long id, ChangeReportStatusRequest request) {
        getReportEntity(id);
        reportRepository.updateReportStatus(id, request.status(), request.reviewedBy());
    }

    @Override
    @Transactional
    public void deleteReport(Long id) {
        getReportEntity(id);
        reportRepository.deleteReport(id);
    }

    private ReportEntity getReportEntity(Long id) {
        ReportEntity entity = reportRepository.getReportDetail(id);
        if (entity == null) {
            throw new BaseException(CommunityMessages.COMMUNITY_REPORT_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return entity;
    }
}
