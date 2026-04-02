package com.dawne.com2usbaseball.domain.player.dto.response.attribute;

public record HitterAttributeResponse(
        Long card_id,
        Short accuracy, // '정확'
        Short power, // '파워'
        Short contact, // '선구'
        Short speed, // '주력'
        Short defense // '수비'
) implements PlayerCardAttributeResponse{
}
