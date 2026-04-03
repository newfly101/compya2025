package com.dawne.com2usbaseball.domain.community.dto.response;

import com.dawne.com2usbaseball.domain.community.enums.ReportReason;
import com.dawne.com2usbaseball.domain.community.enums.ReportStatus;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record ReportResponse (
        Long id,
        ReportTargetType targetType,
        Long targetId,
        Long reporterId,
        ReportReason reason,
        String detail,
        ReportStatus status,
        Long reviewedBy,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime reviewedAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt
) {}
