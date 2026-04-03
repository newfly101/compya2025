package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.ChangeReportStatusRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.ReportResponse;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;
import com.dawne.com2usbaseball.domain.community.service.report.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping
    public ListResponse<ReportResponse> getReportList() {
        return adminReportService.getReportList();
    }

    @GetMapping("/pending")
    public ListResponse<ReportResponse> getPendingReportList() {
        return adminReportService.getPendingReportList();
    }

    @GetMapping("/target")
    public ListResponse<ReportResponse> getReportListByTarget(@RequestParam ReportTargetType targetType,
                                                              @RequestParam Long targetId) {
        return adminReportService.getReportListByTarget(targetType, targetId);
    }

    @GetMapping("/{id}")
    public ReportResponse getReportDetail(@PathVariable Long id) {
        return adminReportService.getReportDetail(id);
    }

    @PatchMapping("/{id}/status")
    public void updateReportStatus(@PathVariable Long id,
                                   @RequestBody ChangeReportStatusRequest request) {
        adminReportService.updateReportStatus(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteReport(@PathVariable Long id) {
        adminReportService.deleteReport(id);
    }
}
