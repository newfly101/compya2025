package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlayerCardPitcherPitchGradesEntity {
    private Long cardId;
    private String fourSeamGrade;
    private String twoSeamGrade;
    private String changeupGrade;
    private String circleChangeupGrade;
    private String sliderGrade;
    private String curveGrade;
    private String forkballGrade;
    private String cutterGrade;
    private String sinkerGrade;
    private String splitterGrade;

}
