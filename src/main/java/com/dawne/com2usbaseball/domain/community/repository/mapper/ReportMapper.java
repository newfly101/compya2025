package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.ReportEntity;
import com.dawne.com2usbaseball.domain.community.enums.ReportStatus;
import com.dawne.com2usbaseball.domain.community.enums.ReportTargetType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReportMapper {

    List<ReportEntity> getReportList();

    List<ReportEntity> getPendingReportList();

    List<ReportEntity> getReportListByTarget(@Param("targetType") ReportTargetType targetType,
                                             @Param("targetId") Long targetId);

    ReportEntity getReportDetail(@Param("id") Long id);

    ReportEntity getReportByReporter(@Param("targetType") ReportTargetType targetType,
                                     @Param("targetId") Long targetId,
                                     @Param("reporterId") Long reporterId);

    int insertReport(ReportEntity entity);

    int updateReportStatus(@Param("id") Long id,
                           @Param("status") ReportStatus status,
                           @Param("reviewedBy") Long reviewedBy);

    int deleteReport(@Param("id") Long id);
}
