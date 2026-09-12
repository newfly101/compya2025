package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import lombok.*;

/** data_player_card_pitch. 보유한 구종만 행이 있다(legend_pitch 와 동일한 설계). */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerCardPitchEntity {
    private String pitchCode;
    private String pitchGrade;
}
