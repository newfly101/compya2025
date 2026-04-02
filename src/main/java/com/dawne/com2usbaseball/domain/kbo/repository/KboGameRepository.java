package com.dawne.com2usbaseball.domain.kbo.repository;

import com.dawne.com2usbaseball.domain.kbo.entity.KboGameEntity;
import com.dawne.com2usbaseball.domain.kbo.repository.mapper.KboGameMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class KboGameRepository {

    private final KboGameMapper mapper;

    public List<KboGameEntity> selectTodayGames() {
        return mapper.selectGamesByDate(LocalDate.now());
    }

    public KboGameEntity selectGameById(String gameId) {
        return mapper.selectGameById(gameId);
    }

    /** 해당 팀의 gameDate 이전 최근 5경기 결과 반환 */
    public List<String> selectRecentResults(String teamCode, LocalDate gameDate) {
        return mapper.selectRecentResults(teamCode, gameDate);
    }
}
