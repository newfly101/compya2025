package com.dawne.com2usbaseball.domain.fun.playerCard.service;

import com.dawne.com2usbaseball.domain.fun.playerCard.dto.PlayerCardSnapshot;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.PlayerCardResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.PlayerCardStatResponse;

import java.util.List;

public interface PlayerCardService {

    /** NORMAL 선수 카드 전량. 필터·정렬·팝오버 상태는 화면이 한다. */
    PlayerCardSnapshot<PlayerCardResponse> getAll();

    /** 구단 하나(전체 연도)의 카드 스탯 + 구종 전량. 연도·포지션 필터는 화면이 한다. */
    PlayerCardSnapshot<PlayerCardStatResponse> getStatsByTeam(String teamCode);

    /** 어드민 캐시 동기화 전용 — 구단별 캐시를 전부 다시 채울 때 순회할 코드 목록. */
    List<String> getTeamCodes();
}
