package com.dawne.com2usbaseball.domain.legendCollection.repository.mapper;

import com.dawne.com2usbaseball.domain.legendCollection.entity.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface LegendCollectionMapper {

    // ── 마스터 (읽기만) ──
    List<String> findAllLegendIds();

    List<MaterialRefEntity> findAllMaterialRefs();

    // ── 내 기록 조회 ──
    List<MaterialStateEntity> findMaterialStates(@Param("userId") Long userId);

    List<LegendStateEntity> findLegendStates(@Param("userId") Long userId);

    List<PreferenceEntity> findPreferences(@Param("userId") Long userId);

    /** 세 테이블 updated_at 의 최댓값. 기록이 없으면 null. */
    LocalDateTime findLatestUpdatedAt(@Param("userId") Long userId);

    // ── 쓰기 ──
    int deleteMaterialStatesByLegendIds(@Param("userId") Long userId, @Param("legendIds") List<String> legendIds);

    int deleteMaterialState(@Param("userId") Long userId, @Param("materialId") String materialId);

    int upsertMaterialState(@Param("userId") Long userId, @Param("materialId") String materialId,
                            @Param("state") String state);

    int deleteLegendState(@Param("userId") Long userId, @Param("legendId") String legendId);

    int upsertLegendState(@Param("userId") Long userId, @Param("legendId") String legendId,
                          @Param("status") String status, @Param("acquiredAt") LocalDate acquiredAt,
                          @Param("frameAcquiredAt") LocalDate frameAcquiredAt);

    int updateAcquiredDates(@Param("userId") Long userId, @Param("legendId") String legendId,
                            @Param("setFrame") boolean setFrame, @Param("frameAcquiredAt") LocalDate frameAcquiredAt,
                            @Param("setAcquired") boolean setAcquired, @Param("acquiredAt") LocalDate acquiredAt);

    /** 상태 변경 로그 한 줄. from/to 가 null 이면 미보유. */
    int insertLegendStateLog(@Param("userId") Long userId, @Param("legendId") String legendId,
                             @Param("fromStatus") String fromStatus, @Param("toStatus") String toStatus);

    int deleteAllPreferences(@Param("userId") Long userId);

    int insertPreference(@Param("userId") Long userId, @Param("legendId") String legendId,
                         @Param("rankNo") int rankNo);

    // ── 일정 ──
    List<ScheduleItemEntity> findSchedule(@Param("userId") Long userId);
}
