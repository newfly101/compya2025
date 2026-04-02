package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlayerCardPositionsEntity {
    Long id;
    Long cardId;
    String positionCode;
    Short displayOrder;
}
