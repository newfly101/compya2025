package com.dawne.com2usbaseball.domain.player.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PitcherAttributeEntity {
    Long cardId;
    Short control; // '제구'
    Short velocity; // '구위'
    Short stamina; // '체력'
    Short fastball; // '직구'
    Short breaking; // '변화'
}
