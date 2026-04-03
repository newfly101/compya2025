package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.ReportStatus;

public record ChangeReportStatusRequest(
        ReportStatus status,
        Long reviewedBy
) {
}
