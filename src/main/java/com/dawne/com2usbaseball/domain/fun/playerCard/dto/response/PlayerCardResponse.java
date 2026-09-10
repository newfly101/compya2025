package com.dawne.com2usbaseball.domain.fun.playerCard.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 선수 카드 1건. 11,668건이 한 응답에 실려 필드명을 최대한 줄였다.
 *
 * n=playerName, tm=teamCode, y=seasonYear, t=HITTER/PITCHER 첫 글자("H"/"P"),
 * pos=positionCode, sg=has_signature(0/1).
 *
 * L/LN 은 레전드 재료인 카드에만 채운다 — 나머지 11,224건에 L:0 을 넣으면 용량만 는다.
 * 클래스 레벨 NON_NULL 로 null 이면 아예 빠지게 한다. n/tm/y/t/pos/sg 는 DB NOT NULL 이라
 * 이 설정의 영향을 받지 않는다.
 *
 * cardId(UUID) 는 절대 넣지 않는다 — gzip 기준 392KB -> 70KB 실측 차이. FE 가 키/팝오버 상태를
 * 직접 만든다. 카드별 스탯이 필요해지면 그때 별도 단건 조회를 붙인다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PlayerCardResponse(
        String n,
        String tm,
        Integer y,
        String t,
        String pos,
        Integer sg,
        Integer L,
        String LN
) {
}
