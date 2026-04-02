package com.dawne.com2usbaseball.domain.player.dto.response.attribute;

public record PitcherAttributeResponse(
        Long card_id,
        Short control, // '제구'
        Short velocity, // '구위'
        Short stamina, // '체력'
        Short fastball, // '직구'
        Short breaking // '변화'
) implements PlayerCardAttributeResponse {
}
