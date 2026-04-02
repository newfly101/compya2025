package com.dawne.com2usbaseball.domain.kbo.service;

import com.dawne.com2usbaseball.domain.kbo.dto.response.KboMatchResponse;
import com.dawne.com2usbaseball.domain.kbo.dto.response.TodayMatchesResponse;
import com.dawne.com2usbaseball.domain.kbo.entity.KboGameEntity;
import com.dawne.com2usbaseball.domain.kbo.repository.KboGameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KboGameServiceImpl implements KboGameService {

    private final KboGameRepository repository;

    @Override
    @Cacheable(value = "kboMatches", key = "'today'")
    public TodayMatchesResponse getTodayMatches() {
        List<KboGameEntity> games = repository.selectTodayGames();

        List<KboMatchResponse> matches = games.stream()
                .map(game -> {
                    String homeCode = game.getHomeTeamCode();
                    String awayCode = game.getAwayTeamCode();
                    List<String> homeRecent = repository.selectRecentResults(
                            homeCode, game.getGameDate());
                    List<String> awayRecent = repository.selectRecentResults(
                            awayCode, game.getGameDate());
                    return KboMatchResponse.from(game, homeRecent, awayRecent);
                })
                .toList();

        return TodayMatchesResponse.of(matches);
    }

    @Override
    @Cacheable(value = "kboMatches", key = "#matchId")
    public KboMatchResponse getMatchDetail(String matchId) {
        KboGameEntity game = repository.selectGameById(matchId);
        if (game == null) return null;

        String homeCode = game.getHomeTeamCode();
        String awayCode = game.getAwayTeamCode();

        List<String> homeRecent = repository.selectRecentResults(
                homeCode, game.getGameDate());
        List<String> awayRecent = repository.selectRecentResults(
                awayCode, game.getGameDate());

        return KboMatchResponse.from(game, homeRecent, awayRecent);
    }
}
