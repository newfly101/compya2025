package com.dawne.com2usbaseball.domain.kbo.service;

import com.dawne.com2usbaseball.domain.kbo.dto.response.KboMatchResponse;
import com.dawne.com2usbaseball.domain.kbo.dto.response.TodayMatchesResponse;

public interface KboGameService {

    /** 오늘 경기 목록 + 팀별 최근 5경기 결과 반환 */
    TodayMatchesResponse getTodayMatches();

    /** 경기 단건 상세 반환 */
    KboMatchResponse getMatchDetail(String matchId);
}
