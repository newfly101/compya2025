package com.dawne.com2usbaseball.domain.kbo.dto.response;

import java.util.List;

public record TodayMatchesResponse(List<KboMatchResponse> matches) {

    public static TodayMatchesResponse of(List<KboMatchResponse> matches) {
        return new TodayMatchesResponse(matches == null ? List.of() : matches);
    }
}
