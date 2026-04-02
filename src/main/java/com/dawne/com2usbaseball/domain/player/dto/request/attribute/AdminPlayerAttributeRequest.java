package com.dawne.com2usbaseball.domain.player.dto.request.attribute;

import com.dawne.com2usbaseball.domain.player.entity.HitterAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PitcherAttributeEntity;

public record AdminPlayerAttributeRequest(
        HitterAttributes hitter,
        PitcherAttributes pitcher
) {
    public HitterAttributeEntity toHitterEntityIfMatch() {
        return HitterAttributeEntity.builder()
                .accuracy(hitter.accuracy())
                .power(hitter.power())
                .contact(hitter.contact())
                .speed(hitter.speed())
                .defense(hitter.defense())
                .build();
    }

    public PitcherAttributeEntity toPitcherEntityIfMatch() {
        return PitcherAttributeEntity.builder()
                .control(pitcher.control())
                .velocity(pitcher.velocity())
                .stamina(pitcher.stamina())
                .fastball(pitcher.fastball())
                .breaking(pitcher.breaking())
                .build();
    }
}
