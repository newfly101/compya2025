package com.dawne.com2usbaseball.domain.community.service.report;

import com.dawne.com2usbaseball.domain.community.dto.request.ReportRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.ReportResponse;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;

public interface ReportService {

    ReportResponse getReportByReporter(ReportTargetType targetType, Long targetId, Long reporterId);

    ReportResponse createReport(ReportRequest request);
}
