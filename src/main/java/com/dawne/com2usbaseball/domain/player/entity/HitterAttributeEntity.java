package com.dawne.com2usbaseball.domain.player.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HitterAttributeEntity {
    Long cardId;
    Short accuracy; // '정확'
    Short power; // '파워'
    Short contact; // '선구'
    Short speed; // '주력'
    Short defense; // '수비'
}
