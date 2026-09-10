package com.dawne.com2usbaseball.domain.fun.mileage.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 구단×연도×포지션에 선수가 한 명뿐이라 확정 저격이 가능한 카드 1행.
 * legendName 은 이 카드가 재료로 쓰이는 레전드 이름이다(1카드-1레전드, 0건 중복 실측 확인).
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MileageSniperTargetEntity {

    private String cardId;
    private String teamCode;
    private Integer seasonYear;
    private String positionCode;
    private String playerName;
    private String legendName;
}
