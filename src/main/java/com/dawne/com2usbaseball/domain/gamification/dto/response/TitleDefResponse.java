package com.dawne.com2usbaseball.domain.gamification.dto.response;

/** 칭호 정의 한 건 + 내가 가졌는지. 잠긴 칭호는 condition 으로 얻는 법을 보여준다. */
public record TitleDefResponse(String code, String name, String category, String condition,
                               int bonusPoint, boolean owned, boolean equipped) {
}
