package com.dawne.com2usbaseball.domain.player.dto.request.attribute;

public record HitterAttributes(
        Short accuracy,
        Short power,
        Short contact,
        Short speed,
        Short defense
) {
}
