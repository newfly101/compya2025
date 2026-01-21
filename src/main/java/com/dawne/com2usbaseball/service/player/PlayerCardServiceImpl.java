package com.dawne.com2usbaseball.service.player;

import com.dawne.com2usbaseball.dto.response.player.PlayerCardResponse;
import com.dawne.com2usbaseball.dto.response.player.team.TeamResponse;
import com.dawne.com2usbaseball.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.entity.TeamsEntity;
import com.dawne.com2usbaseball.enums.Target;
import com.dawne.com2usbaseball.repository.PlayerCardInfoRepository;
import com.dawne.com2usbaseball.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlayerCardServiceImpl implements PlayerCardService {

    private final PlayerCardInfoRepository repository;
    private final TeamRepository teamrepository;
    private final CardNameGrouper cardNameGrouper;
    private final CardInfoMaker cardInfoMaker;

    @Override
    public List<PlayerCardResponse> getPlayerInfo(Target target) {

        List<PlayerCardEntity> list = repository.findAllPlayerCardInfoByPosition(target);

        Map<String, List<PlayerCardEntity>> grouped = cardNameGrouper.nameListMap(list);

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


        List<PlayerCardResponse> cardInfoList = cardInfoMaker.makeCardInfoList(grouped, teamMap);

        return cardInfoList;
    }
}
