package com.dawne.com2usbaseball.domain.player.service.support;

import com.dawne.com2usbaseball.domain.player.dto.response.LegendPlayerCardResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.career.PlayerCareerResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.game.LegendPlayerGameInfoResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.game.attributes.HitterAttributesResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.game.attributes.PitcherAttributesResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.game.attributes.PlayerAttributesResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.identity.LegendPlayerIdentityResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.team.TeamResponse;
import com.dawne.com2usbaseball.domain.player.entity.PlayerLegendCardEntity;
import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.common.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CardInfoMaker {

    public List<LegendPlayerCardResponse> makeCardInfoList(
            Map<String, List<PlayerLegendCardEntity>> grouped,
            Map<Long, TeamResponse> teamMap,
            Map<String, PlayerCareerResponse> careerMap
    ) {

        List<LegendPlayerCardResponse> result = new ArrayList<>();

        for (List<PlayerLegendCardEntity> entities : grouped.values()) {
            if (entities.isEmpty()) continue;

            PlayerLegendCardEntity base = entities.get(0);

            LegendPlayerIdentityResponse identity =
                    buildIdentity(base, teamMap);

            LegendPlayerGameInfoResponse game =
                    buildGameInfo(entities);

            PlayerCareerResponse career =
                    careerMap.get(base.getName());

            result.add(new LegendPlayerCardResponse(identity, game, career));
        }

        return result;
    }

    // identity 객체화
    private LegendPlayerIdentityResponse buildIdentity(
            PlayerLegendCardEntity base,
            Map<Long, TeamResponse> teamMap
    ) {

        return new LegendPlayerIdentityResponse(
                base.getId(),
                base.getName(),
                teamMap.get(base.getTeamId()),
                base.getGrade(),
                base.getBackNumber(),
                base.getBirthDate().toLocalDate(),
                base.getBatThrow()
        );
    }

    // gameInfo 객체화
    private LegendPlayerGameInfoResponse buildGameInfo(
            List<PlayerLegendCardEntity> entities
    ) {

        // 현재 구조상 마지막 카드 = 대표 카드
        PlayerLegendCardEntity card = entities.get(entities.size() - 1);

        return new LegendPlayerGameInfoResponse(
                card.getOverall(),
                JsonUtils.toList(card.getPositions()),
                JsonUtils.toList(card.getTraits()),
                buildAttributes(card)
        );
    }

    // 선수 능력치 정보 객체화
    private PlayerAttributesResponse buildAttributes(
            PlayerLegendCardEntity card
    ) {

        if (card.getRole() == Target.PITCHER) {
            return JsonUtils.toObject(
                    card.getAttributes(),
                    PitcherAttributesResponse.class
            );
        }

        return JsonUtils.toObject(
                card.getAttributes(),
                HitterAttributesResponse.class
        );
    }
}
