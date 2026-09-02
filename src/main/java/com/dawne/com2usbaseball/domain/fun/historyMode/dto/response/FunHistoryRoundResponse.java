package com.dawne.com2usbaseball.domain.fun.historyMode.dto.response;

import java.util.List;

/**
 * 라운드 1개 + 25인 로스터 전체.
 * 재료만 추려 내리지 않는다 — 덱빌딩 화면이 같은 응답을 쓴다.
 *
 * weekNo·dayOfWeek 는 dayNo 에서 계산한 값이라 DB 에 없다.
 */
public record FunHistoryRoundResponse(
        Short dayNo,
        int weekNo,
        String dayOfWeek,
        Short roundNo,
        String roundLabel,
        List<FunHistoryRosterResponse> roster
) {
}
