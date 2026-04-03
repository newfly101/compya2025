package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.ReportEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReportMapper {

    List<ReportEntity> getReportList();

    List<ReportEntity> getPendingReportList();

    List<ReportEntity> getReportListByTarget(@Param("targetType") String targetType,
                                             @Param("targetId") Long targetId);

    ReportEntity getReportDetail(@Param("id") Long id);

    ReportEntity getReportByReporter(@Param("targetType") String targetType,
                                     @Param("targetId") Long targetId,
                                     @Param("reporterId") Long reporterId);

    int insertReport(ReportEntity entity);

    int updateReportStatus(@Param("id") Long id,
                           @Param("status") String status,
                           @Param("reviewedBy") Long reviewedBy);

    int deleteReport(@Param("id") Long id);
}
