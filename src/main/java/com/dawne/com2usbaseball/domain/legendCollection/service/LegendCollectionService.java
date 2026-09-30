package com.dawne.com2usbaseball.domain.legendCollection.service;

import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveChangesRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SavePreferencesRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.response.LegendCollectionResponse;
import com.dawne.com2usbaseball.domain.legendCollection.dto.response.LegendScheduleResponse;

public interface LegendCollectionService {

    LegendCollectionResponse getMyCollection(Long userId);

    LegendCollectionResponse saveChanges(Long userId, SaveChangesRequest request);

    LegendCollectionResponse savePreferences(Long userId, SavePreferencesRequest request);

    LegendScheduleResponse getSchedule(Long userId);
}
