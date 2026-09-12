package com.dawne.com2usbaseball.domain.fun.playerCard.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * 구단 하나(전체 연도)의 카드별 태생 스탯 + 구종. GET /api/player-cards/{teamCode}/stats 응답 1건.
 *
 * 조회 자체가 구단 하나로 좁혀 들어오므로 tm(팀코드)은 다시 싣지 않는다 — 응답 전체가 그 구단이다.
 * n/y/pos 는 PlayerCardResponse(카드 목록) 의 n/y/pos 와 **값이 동일**하다 — 화면은
 * `${tm}-${y}-${pos}-${n}` 키로 두 응답을 잇는다(tm 은 이 API 를 부를 때 쓴 teamCode 그대로 채운다).
 *
 * t(H/P) 는 카드 목록 쪽에도 있지만, 이 응답 하나만으로 스탯 표(정확·파워·선구·주력·수비 vs
 * 제구·구위·체력·직구·변화) 라벨을 붙일 수 있도록 다시 싣는다 — 1글자라 비용이 작다.
 *
 * st 는 stat1~stat5 를 순서 그대로 담은 5칸 배열이다. 슬롯 의미는 t 가 정한다.
 * OVR 은 담지 않는다 — 5스탯 평균이라 화면이 계산한다(legendStat 과 동일한 판단).
 *
 * pt 는 투수만, 보유한 구종만 담는다. 타자는 클래스 레벨 NON_NULL 로 키째 응답에서 빠진다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PlayerCardStatResponse(
        String n,
        Integer y,
        String pos,
        String t,
        List<Short> st,
        List<PlayerCardPitchResponse> pt
) {
}
