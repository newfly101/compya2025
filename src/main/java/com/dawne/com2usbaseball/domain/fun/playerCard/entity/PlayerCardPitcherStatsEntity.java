package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerCardPitcherStatsEntity {
    Long cardId;
    Short control;
    Short velocity;
    Short stamina;
    Short fastball;
    Short breaking;
}
