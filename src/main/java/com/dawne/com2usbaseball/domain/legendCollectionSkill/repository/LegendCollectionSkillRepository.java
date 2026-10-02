package com.dawne.com2usbaseball.domain.legendCollectionSkill.repository;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.SkillLogEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.SkillMasterEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.UserLegendSkillEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillAction;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.repository.mapper.LegendCollectionSkillMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class LegendCollectionSkillRepository {

    private final LegendCollectionSkillMapper mapper;

    public List<Map<String, String>> findTargetLegends(Long userId) {
        return mapper.findTargetLegends(userId);
    }

    public Optional<String> findTargetStatus(Long userId, String legendId) {
        return Optional.ofNullable(mapper.findTargetStatus(userId, legendId));
    }

    public Optional<String> findLegendRole(String legendId) {
        return Optional.ofNullable(mapper.findLegendRole(legendId));
    }

    public List<UserLegendSkillEntity> findStates(Long userId) {
        return mapper.findStates(userId);
    }

    public Optional<UserLegendSkillEntity> findState(Long userId, String legendId) {
        return Optional.ofNullable(mapper.findState(userId, legendId));
    }

    public List<SkillMasterEntity> findSkills(List<String> ids) {
        return mapper.findSkills(ids);
    }

    public List<SkillLogEntity> findLogs(Long userId, String legendId) {
        return mapper.findLogs(userId, legendId);
    }

    public void upsertState(UserLegendSkillEntity entity) {
        mapper.upsertState(entity);
    }

    public void deleteStates(Long userId, List<String> legendIds) {
        if (legendIds.isEmpty()) {
            return;
        }
        mapper.deleteStates(userId, legendIds);
    }

    public void deleteLogsAfterLastSave(Long userId, String legendId) {
        mapper.deleteLogsAfterLastSave(userId, legendId);
    }

    public void deleteLogs(Long userId, String legendId) {
        mapper.deleteLogs(userId, legendId);
    }

    public void insertLog(Long userId, String legendId, SkillAction action, Integer slot, String snapshot) {
        mapper.insertLog(userId, legendId, action.name(), slot, snapshot);
    }
}
