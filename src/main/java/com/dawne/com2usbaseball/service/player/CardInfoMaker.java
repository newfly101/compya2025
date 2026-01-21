package com.dawne.com2usbaseball.service.player;

import com.dawne.com2usbaseball.dto.response.playerInfo.PlayerCardInfoResponse;
import com.dawne.com2usbaseball.dto.response.playerInfo.PlayerCardResponse;
import com.dawne.com2usbaseball.entity.PlayerCardEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class CardInfoMaker {

    public List<PlayerCardResponse> makeCardInfoList(Map<String, List<PlayerCardEntity>> grouped) {
        List<PlayerCardResponse> result = new ArrayList<>();

        for (List<PlayerCardEntity> cards : grouped.values()) {
            PlayerCardEntity base = cards.get(0);

            List<PlayerCardInfoResponse> cardResponses = new ArrayList<>();
            for (PlayerCardEntity card : cards) {
                cardResponses.add(PlayerCardInfoResponse.from(card));
            }

            result.add(
                    new PlayerCardResponse(
                            base.getName(),
                            base.getTeamId(),
                            base.getRole(),
                            cardResponses
                    )
            );
        }

        return result;
    }
}
