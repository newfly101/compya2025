package com.dawne.com2usbaseball.domain.player.dto.request;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.player.dto.command.PlayerCardFormat;
import com.dawne.com2usbaseball.domain.player.dto.request.attribute.AdminPlayerAttributeRequest;
import com.dawne.com2usbaseball.domain.player.entity.HitterAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PitcherAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;

public record AdminPlayerCardCreateRequest(
        AdminPlayerCardMetaRequest meta,
        AdminPlayerAttributeRequest attributes
) {
    public PlayerCardFormat toFormat() {
        PlayerCardEntity card = meta.toEntity();
        HitterAttributeEntity hitter = null;
        PitcherAttributeEntity pitcher = null;

        if (attributes != null) {
            if (card.getRole() == Target.HITTER) {
                hitter = attributes.toHitterEntityIfMatch();
            } else if (card.getRole() == Target.PITCHER) {
                pitcher = attributes.toPitcherEntityIfMatch();
            }
        }

        return new PlayerCardFormat(card, hitter, pitcher);
    }
}
