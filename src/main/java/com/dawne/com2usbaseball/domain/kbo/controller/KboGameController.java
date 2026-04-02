package com.dawne.com2usbaseball.domain.kbo.controller;

import com.dawne.com2usbaseball.domain.kbo.dto.response.KboMatchResponse;
import com.dawne.com2usbaseball.domain.kbo.dto.response.TodayMatchesResponse;
import com.dawne.com2usbaseball.domain.kbo.service.KboGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/kbo")
public class KboGameController {

    private final KboGameService kboGameService;

    /**
     * GET /api/kbo/matches/today
     * Redux: KBO_ACTIONS.GET_TODAY_MATCHES → store/public/api.js
     */
    @GetMapping("/matches/today")
    public TodayMatchesResponse getTodayMatches() {
        return kboGameService.getTodayMatches();
    }

    /**
     * GET /api/kbo/matches/{matchId}
     * Redux: KBO_ACTIONS.GET_MATCH_DETAIL → store/public/api.js
     */
    @GetMapping("/matches/{matchId}")
    public KboMatchResponse getMatchDetail(@PathVariable String matchId) {
        return kboGameService.getMatchDetail(matchId);
    }
}
