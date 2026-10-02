package com.dawne.com2usbaseball.domain.legendCollection.dto.response;

import com.dawne.com2usbaseball.domain.legendCollection.entity.LegendStateEntity;
import com.dawne.com2usbaseball.domain.legendCollection.entity.MaterialStateEntity;
import com.dawne.com2usbaseball.domain.legendCollection.entity.PreferenceEntity;
import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendStatus;
import com.dawne.com2usbaseball.domain.legendCollection.enums.MaterialState;

import java.util.List;

/** 내 기록 전체. 미보유는 행이 없으므로 목록에 나오지 않는다. */
public record LegendCollectionResponse(
        String version,
        List<LegendItem> legends,
        List<MaterialItem> materials,
        List<PreferenceItem> preferences
) {
    /** acquiredAt(보유중이 된 날) · frameAcquiredAt(액자로 얻은 날): "yyyy-MM-dd" 또는 null. */
    public record LegendItem(String legendId, LegendStatus status, String acquiredAt, String frameAcquiredAt) {
    }

    public record MaterialItem(String materialId, MaterialState state) {
    }

    public record PreferenceItem(String legendId, int rank) {
    }

    public static LegendCollectionResponse of(String version,
                                              List<LegendStateEntity> legends,
                                              List<MaterialStateEntity> materials,
                                              List<PreferenceEntity> preferences) {
        return new LegendCollectionResponse(
                version,
                legends.stream().map(e -> new LegendItem(e.getLegendId(), e.getStatus(),
                        e.getAcquiredAt() == null ? null : e.getAcquiredAt().toString(),
                        e.getFrameAcquiredAt() == null ? null : e.getFrameAcquiredAt().toString())).toList(),
                materials.stream().map(e -> new MaterialItem(e.getMaterialId(), e.getState())).toList(),
                preferences.stream().map(e -> new PreferenceItem(e.getLegendId(), e.getRankNo())).toList());
    }
}
