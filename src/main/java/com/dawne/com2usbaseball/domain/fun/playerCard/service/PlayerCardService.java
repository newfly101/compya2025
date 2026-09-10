package com.dawne.com2usbaseball.domain.fun.playerCard.service;

import com.dawne.com2usbaseball.domain.fun.playerCard.dto.PlayerCardSnapshot;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.PlayerCardResponse;

public interface PlayerCardService {

    /** NORMAL 선수 카드 전량. 필터·정렬·팝오버 상태는 화면이 한다. */
    PlayerCardSnapshot<PlayerCardResponse> getAll();
}
