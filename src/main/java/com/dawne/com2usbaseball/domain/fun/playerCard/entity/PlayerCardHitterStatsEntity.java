package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import lombok.*;

@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PlayerCardHitterStatsEntity {
    private Long cardId;
    private Short accuracy;
    private Short power;
    private Short discipline;
    private Short speed;
    private Short defense;
}
