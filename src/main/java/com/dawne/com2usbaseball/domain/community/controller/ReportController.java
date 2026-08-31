package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.request.ReportRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.ReportResponse;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;
import com.dawne.com2usbaseball.domain.community.service.report.ReportService;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/me")
    public ReportResponse getReportByReporter(@RequestParam ReportTargetType targetType,
                                              @RequestParam Long targetId,
                                              HttpServletRequest httpRequest) {
        Long reporterId = requireUserId(httpRequest);
        return reportService.getReportByReporter(targetType, targetId, reporterId);
    }

    @PostMapping
    public ReportResponse createReport(@RequestBody ReportRequest request, HttpServletRequest httpRequest) {
        Long reporterId = requireUserId(httpRequest);
        return reportService.createReport(request, reporterId);
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        return userId;
    }
}
