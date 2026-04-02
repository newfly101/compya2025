package com.dawne.com2usbaseball.domain.player.service.support;

import com.dawne.com2usbaseball.domain.player.entity.PlayerLegendCardEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CardNameGrouper {

    public Map<String, List<PlayerLegendCardEntity>> nameListMap(List<PlayerLegendCardEntity> list) {

        Map<String, List<PlayerLegendCardEntity>> grouped = new HashMap<>();

        for (PlayerLegendCardEntity card : list) {
            grouped
                    .computeIfAbsent(card.getName(), k -> new ArrayList<>())
                    .add(card);
        }

        return grouped;
    }
}
