package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.ReportReason;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;

public record ReportRequest(
        ReportTargetType targetType,
        Long targetId,
        Long reporterId,
        ReportReason reason,
        String detail
) {
}
