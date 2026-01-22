package com.dawne.com2usbaseball.service.player;

import com.dawne.com2usbaseball.dto.response.player.PlayerCardResponse;
import com.dawne.com2usbaseball.dto.response.player.career.HitterCareerResponse;
import com.dawne.com2usbaseball.dto.response.player.career.PitcherCareerResponse;
import com.dawne.com2usbaseball.dto.response.player.career.PlayerCareerResponse;
import com.dawne.com2usbaseball.dto.response.player.team.TeamResponse;
import com.dawne.com2usbaseball.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.entity.TeamsEntity;
import com.dawne.com2usbaseball.enums.Target;
import com.dawne.com2usbaseball.repository.LegendPlayerCareerRepository;
import com.dawne.com2usbaseball.repository.PlayerCardInfoRepository;
import com.dawne.com2usbaseball.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlayerCardServiceImpl implements PlayerCardService {

    private final PlayerCardInfoRepository repository;
    private final LegendPlayerCareerRepository legendRepository;
    private final TeamRepository teamrepository;
    private final CardNameGrouper cardNameGrouper;
    private final CardInfoMaker cardInfoMaker;

    @Override
    @Cacheable(
            value = "playerInfoByTarget",
            key = "#target"
    )
    public List<PlayerCardResponse> getPlayerInfo(Target target) {

        // 카드 기본 정보
        List<PlayerCardEntity> list = repository.findAllPlayerCardInfoByPosition(target);

        // 이름 기준 그룹핑
        Map<String, List<PlayerCardEntity>> grouped = cardNameGrouper.nameListMap(list);

        // 커리어 정보
        Map<String, PlayerCareerResponse> careerMap = playerCareerMap(grouped, target);

        // 팀 정보 (공통 데이터)
        Map<Long, TeamResponse> teamMap = buildTeamMap();


        return cardInfoMaker.makeCardInfoList(grouped, teamMap, careerMap);
    }

    private Map<String, PlayerCareerResponse> playerCareerMap(Map<String, List<PlayerCardEntity>> grouped, Target target) {
        Map<String, PlayerCareerResponse> careerMap = new HashMap<>();

        for (String name : grouped.keySet()) {
            if (target == Target.HITTER) {
                var career = legendRepository.findLegendHitterCareerByName(name);
                if (career != null) {
                    careerMap.put(
                            name,
                            new HitterCareerResponse(
                                    career.getSeasons(),
                                    career.getGames(),
                                    career.getAvg(),
                                    career.getAtBats(),
                                    career.getHits(),
                                    career.getDoubles(),
                                    career.getTriples(),
                                    career.getHomeRuns(),
                                    career.getSteals(),
                                    career.getRbi(),
                                    career.getRuns(),
                                    career.getStrikeouts(),
                                    career.getWalks()
                            )
                    );
                }
            } else {
                var career = legendRepository.findLegendPitcherCareerByName(name);
                if (career != null) {
                    careerMap.put(
                            name,
                            new PitcherCareerResponse(
                                    career.getSeasons(),
                                    career.getGames(),
                                    career.getEra(),
                                    career.getWins(),
                                    career.getLosses(),
                                    career.getSaves(),
                                    career.getHolds(),
                                    career.getStrikeouts(),
                                    career.getWalks(),
                                    career.getHitsAllowed()
                            )
                    );
                }
            }
        }

        return careerMap;

    }

    private Map<Long, TeamResponse> buildTeamMap() {
        List<TeamsEntity> teams = teamrepository.findAll();
        Map<Long, TeamResponse> teamMap = new HashMap<>();

        for (TeamsEntity team : teams) {
            teamMap.put(
                    team.getId(),
                    new TeamResponse(
                            team.getId(),
                            team.getTeamCode(),
                            team.getTeamName()
                    )
            );
        }
        return teamMap;
    }
}
