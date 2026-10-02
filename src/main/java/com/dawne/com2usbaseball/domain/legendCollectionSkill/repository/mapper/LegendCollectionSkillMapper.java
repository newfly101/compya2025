package com.dawne.com2usbaseball.domain.legendCollectionSkill.repository.mapper;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.SkillLogEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.SkillMasterEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.UserLegendSkillEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface LegendCollectionSkillMapper {

    /** 액자·보유중 레전드 [legendId, status]. */
    List<Map<String, String>> findTargetLegends(@Param("userId") Long userId);

    /** 대상(액자·보유중)이면 그 상태, 아니면 null. */
    String findTargetStatus(@Param("userId") Long userId, @Param("legendId") String legendId);

    /** 레전드 마스터의 HITTER / PITCHER. 없으면 null. */
    String findLegendRole(@Param("legendId") String legendId);

    List<UserLegendSkillEntity> findStates(@Param("userId") Long userId);

    UserLegendSkillEntity findState(@Param("userId") Long userId, @Param("legendId") String legendId);

    List<SkillMasterEntity> findSkills(@Param("ids") List<String> ids);

    /** legendId 가 null 이면 이용자 전체. */
    List<SkillLogEntity> findLogs(@Param("userId") Long userId, @Param("legendId") String legendId);

    int upsertState(@Param("e") UserLegendSkillEntity entity);

    int deleteStates(@Param("userId") Long userId, @Param("legendIds") List<String> legendIds);

    /** 그 레전드의 마지막 SAVE 로그 이후 로그 삭제 (SAVE 는 유지). */
    int deleteLogsAfterLastSave(@Param("userId") Long userId, @Param("legendId") String legendId);

    /** 그 레전드의 로그 전부 삭제. */
    int deleteLogs(@Param("userId") Long userId, @Param("legendId") String legendId);

    int insertLog(@Param("userId") Long userId, @Param("legendId") String legendId,
                  @Param("action") String action, @Param("slot") Integer slot,
                  @Param("snapshot") String snapshot);
}
