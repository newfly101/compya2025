package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.ReportEntity;
import com.dawne.com2usbaseball.domain.community.enums.ReportStatus;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;
import com.dawne.com2usbaseball.domain.community.repository.mapper.ReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ReportRepository {

    private final ReportMapper reportMapper;

    public List<ReportEntity> getReportList() {
        return reportMapper.getReportList();
    }

    public List<ReportEntity> getPendingReportList() {
        return reportMapper.getPendingReportList();
    }

    public List<ReportEntity> getReportListByTarget(ReportTargetType targetType, Long targetId) {
        return reportMapper.getReportListByTarget(targetType, targetId);
    }

    public ReportEntity getReportDetail(Long id) {
        return reportMapper.getReportDetail(id);
    }

    public ReportEntity getReportByReporter(ReportTargetType targetType, Long targetId, Long reporterId) {
        return reportMapper.getReportByReporter(targetType, targetId, reporterId);
    }

    public int insertReport(ReportEntity entity) {
        return reportMapper.insertReport(entity);
    }

    public int updateReportStatus(Long id, ReportStatus status, Long reviewedBy) {
        return reportMapper.updateReportStatus(id, status, reviewedBy);
    }

    public int deleteReport(Long id) {
        return reportMapper.deleteReport(id);
    }
}
