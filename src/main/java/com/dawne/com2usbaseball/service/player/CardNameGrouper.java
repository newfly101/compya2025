package com.dawne.com2usbaseball.service.player;

import com.dawne.com2usbaseball.entity.PlayerCardEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CardNameGrouper {

    public Map<String, List<PlayerCardEntity>> nameListMap(List<PlayerCardEntity> list) {

        Map<String, List<PlayerCardEntity>> grouped = new HashMap<>();

        for (PlayerCardEntity card : list) {
            grouped
                    .computeIfAbsent(card.getName(), k -> new ArrayList<>())
                    .add(card);
        }

        return grouped;
    }
}
