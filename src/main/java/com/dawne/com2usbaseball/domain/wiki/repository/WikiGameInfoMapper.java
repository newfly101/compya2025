package com.dawne.com2usbaseball.domain.wiki.repository;

import com.dawne.com2usbaseball.domain.wiki.entity.WikiPitchEntity;
import com.dawne.com2usbaseball.domain.wiki.entity.WikiPitchGradeEntity;
import com.dawne.com2usbaseball.domain.wiki.entity.WikiStatInfluenceEntity;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface WikiGameInfoMapper {

    // Public read
    List<WikiPitchEntity> selectActivePitches();
    List<WikiPitchGradeEntity> selectActivePitchGrades();
    List<WikiStatInfluenceEntity> selectActiveStatInfluences(@Param("target") WikiTarget target);

    // Admin read (is_active=false 포함)
    List<WikiPitchEntity> selectAllPitches();
    List<WikiPitchGradeEntity> selectAllPitchGrades();
    List<WikiStatInfluenceEntity> selectAllStatInfluences(@Param("target") WikiTarget target);

    Optional<WikiPitchEntity> selectPitchById(@Param("id") Long id);
    Optional<WikiPitchGradeEntity> selectPitchGradeById(@Param("id") Long id);
    Optional<WikiStatInfluenceEntity> selectStatInfluenceById(@Param("id") Long id);

    // Pitch CRUD
    int insertPitch(WikiPitchEntity entity);
    int updatePitch(WikiPitchEntity entity);
    int softDeletePitch(@Param("id") Long id);

    // PitchGrade CRUD
    int insertPitchGrade(WikiPitchGradeEntity entity);
    int updatePitchGrade(WikiPitchGradeEntity entity);
    int deletePitchGrade(@Param("id") Long id);
    int softDeletePitchGradeByCode(@Param("pitchCode") String pitchCode);

    // StatInfluence CRUD
    int insertStatInfluence(WikiStatInfluenceEntity entity);
    int updateStatInfluence(WikiStatInfluenceEntity entity);
    int softDeleteStatInfluence(@Param("id") Long id);
}
