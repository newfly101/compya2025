package com.dawne.com2usbaseball.domain.player.dto.command;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.player.entity.HitterAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PitcherAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;

public record PlayerCardFormat(
        PlayerCardEntity entity,
        HitterAttributeEntity hitterAttribute,
        PitcherAttributeEntity pitcherAttribute
) {
    public boolean hasAttribute() {
        return hitterAttribute != null || pitcherAttribute != null;
    }

    public HitterAttributeEntity getHitterIfMatch() {
        return entity.getRole() == Target.HITTER ? hitterAttribute : null;
    }

    public PitcherAttributeEntity getPitcherIfMatch() {
        return entity.getRole() == Target.PITCHER ? pitcherAttribute : null;
    }
}
