package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import lombok.*;

@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PlayerCardHitterStatsEntity {
    Long cardId;
    Short accuracy;
    Short power;
    Short discipline;
    Short speed;
    Short defense;
}
