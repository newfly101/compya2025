package com.dawne.com2usbaseball.domain.community.service.report;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.ChangeReportStatusRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.ReportResponse;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;

public interface AdminReportService {

    ListResponse<ReportResponse> getReportList();

    ListResponse<ReportResponse> getPendingReportList();

    ListResponse<ReportResponse> getReportListByTarget(ReportTargetType targetType, Long targetId);

    ReportResponse getReportDetail(Long id);

    void updateReportStatus(Long id, ChangeReportStatusRequest request);

    void deleteReport(Long id);
}
