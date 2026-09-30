package com.dawne.com2usbaseball.domain.legendCollection.repository;

import com.dawne.com2usbaseball.domain.legendCollection.entity.*;
import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendStatus;
import com.dawne.com2usbaseball.domain.legendCollection.enums.MaterialState;
import com.dawne.com2usbaseball.domain.legendCollection.repository.mapper.LegendCollectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class LegendCollectionRepository {

    private final LegendCollectionMapper mapper;

    public List<String> findAllLegendIds() {
        return mapper.findAllLegendIds();
    }

    public List<MaterialRefEntity> findAllMaterialRefs() {
        return mapper.findAllMaterialRefs();
    }

    public List<MaterialStateEntity> findMaterialStates(Long userId) {
        return mapper.findMaterialStates(userId);
    }

    public List<LegendStateEntity> findLegendStates(Long userId) {
        return mapper.findLegendStates(userId);
    }

    public List<PreferenceEntity> findPreferences(Long userId) {
        return mapper.findPreferences(userId);
    }

    public LocalDateTime findLatestUpdatedAt(Long userId) {
        return mapper.findLatestUpdatedAt(userId);
    }

    public void deleteMaterialStatesByLegendIds(Long userId, List<String> legendIds) {
        if (legendIds.isEmpty()) {
            return;
        }
        mapper.deleteMaterialStatesByLegendIds(userId, legendIds);
    }

    public void deleteMaterialState(Long userId, String materialId) {
        mapper.deleteMaterialState(userId, materialId);
    }

    public void upsertMaterialState(Long userId, String materialId, MaterialState state) {
        mapper.upsertMaterialState(userId, materialId, state.name());
    }

    public void deleteLegendState(Long userId, String legendId) {
        mapper.deleteLegendState(userId, legendId);
    }

    public void upsertLegendState(Long userId, String legendId, LegendStatus status) {
        mapper.upsertLegendState(userId, legendId, status.name());
    }

    public void deleteAllPreferences(Long userId) {
        mapper.deleteAllPreferences(userId);
    }

    public void insertPreference(Long userId, String legendId, int rankNo) {
        mapper.insertPreference(userId, legendId, rankNo);
    }

    public List<ScheduleItemEntity> findSchedule(Long userId) {
        return mapper.findSchedule(userId);
    }
}
