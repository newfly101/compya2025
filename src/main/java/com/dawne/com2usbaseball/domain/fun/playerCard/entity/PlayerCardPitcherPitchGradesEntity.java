package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlayerCardPitcherPitchGradesEntity {
    Long cardId;
    String fourSeamGrade;
    String twoSeamGrade;
    String changeupGrade;
    String circleChangeupGrade;
    String sliderGrade;
    String curveGrade;
    String forkballGrade;
    String cutterGrade;
    String sinkerGrade;
    String splitterGrade;

}
