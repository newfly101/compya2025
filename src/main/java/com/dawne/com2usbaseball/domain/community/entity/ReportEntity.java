package com.dawne.com2usbaseball.domain.community.entity;

import com.dawne.com2usbaseball.domain.community.enums.ReportReason;
import com.dawne.com2usbaseball.domain.community.enums.ReportStatus;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportEntity {
    private Long id;
    private ReportTargetType targetType;
    private Long targetId;

    private Long reporterId;

    private ReportReason reason;
    private String detail;

    private ReportStatus status;
    private Long reviewedBy;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime reviewedAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
}
