package com.dawne.com2usbaseball.domain.legendCollection.service;

import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveChangesRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SavePreferencesRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.response.LegendCollectionResponse;
import com.dawne.com2usbaseball.domain.legendCollection.dto.response.LegendScheduleResponse;

public interface LegendCollectionService {

    LegendCollectionResponse getMyCollection(Long userId);

    LegendCollectionResponse saveChanges(Long userId, SaveChangesRequest request);

    LegendCollectionResponse savePreferences(Long userId, SavePreferencesRequest request);

    /** 획득일 저장. 액자는 액자 획득일만, 보유중은 둘 다. 미보유·액자에 보유일·미래 날짜는 400. */
    LegendCollectionResponse saveAcquiredAt(Long userId, String legendId,
                                            com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveAcquiredAtRequest request);

    LegendScheduleResponse getSchedule(Long userId);
}
