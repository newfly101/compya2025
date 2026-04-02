package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerCardPitcherStatsEntity {
    private Long cardId;
    private Short control;
    private Short velocity;
    private Short stamina;
    private Short fastball;
    private Short breaking;
}
