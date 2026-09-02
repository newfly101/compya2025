package com.dawne.com2usbaseball.domain.fun.historyMode.dto.response;

/**
 * 로스터 1명.
 * 표시용 카드 문자열("이만수'82")은 화면이 조립한다 — 이름과 연도를 쪼개 두어야
 * 재료 마스터와 맞물린다.
 * legendName 이 있으면 그 레전드의 재료 카드다.
 */
public record FunHistoryRosterResponse(
        String rosterGroup,
        Short orderNo,
        String playerName,
        Short seasonYear,
        String positionCode,
        String legendName
) {
}
