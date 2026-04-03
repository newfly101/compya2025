package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.domain.community.dto.request.ReportRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.ReportResponse;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;
import com.dawne.com2usbaseball.domain.community.service.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/me")
    public ReportResponse getReportByReporter(@RequestParam ReportTargetType targetType,
                                              @RequestParam Long targetId,
                                              @RequestParam Long reporterId) {
        return reportService.getReportByReporter(targetType, targetId, reporterId);
    }

    @PostMapping
    public ReportResponse createReport(@RequestBody ReportRequest request) {
        return reportService.createReport(request);
    }
}
