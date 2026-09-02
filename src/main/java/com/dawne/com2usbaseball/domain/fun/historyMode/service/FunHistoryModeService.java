package com.dawne.com2usbaseball.domain.fun.historyMode.service;

import com.dawne.com2usbaseball.domain.fun.historyMode.dto.HistoryRoundSnapshot;
import com.dawne.com2usbaseball.domain.fun.historyMode.dto.response.FunHistoryRoundResponse;

public interface FunHistoryModeService {

    /** 라운드 70개 + 로스터 전량. 필터·검색은 화면이 한다. */
    HistoryRoundSnapshot<FunHistoryRoundResponse> getAllRounds();
}
