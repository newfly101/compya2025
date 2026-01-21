package com.dawne.com2usbaseball.dto.response.playerInfo;

import com.dawne.com2usbaseball.enums.Target;

import java.util.List;

public record PlayerCardResponse(
        String name,
        Long teamId,
        Target role,
        List<PlayerCardInfoResponse> cards
) {
}
