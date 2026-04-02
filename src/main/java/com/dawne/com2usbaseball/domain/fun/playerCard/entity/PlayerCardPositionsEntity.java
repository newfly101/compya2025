package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlayerCardPositionsEntity {
    private Long id;
    private Long cardId;
    private String positionCode;
    private Short displayOrder;
}
