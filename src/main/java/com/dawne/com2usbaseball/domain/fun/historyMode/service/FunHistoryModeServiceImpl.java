package com.dawne.com2usbaseball.domain.fun.historyMode.service;

import com.dawne.com2usbaseball.domain.fun.historyMode.dto.HistoryRoundSnapshot;
import com.dawne.com2usbaseball.domain.fun.historyMode.dto.response.FunHistoryRoundResponse;
import com.dawne.com2usbaseball.domain.fun.historyMode.dto.response.FunHistoryRosterResponse;
import com.dawne.com2usbaseball.domain.fun.historyMode.entity.HistoryRoundEntity;
import com.dawne.com2usbaseball.domain.fun.historyMode.repository.FunHistoryModeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 조회 전용. 캐시를 비우는 경로가 없어 SQL 로 값을 고쳤으면 서버를 재시작해야 한다.
 */
@Service
@RequiredArgsConstructor
public class FunHistoryModeServiceImpl implements FunHistoryModeService {

    /** 1일차 = 월요일. 일차가 곧 요일이라 DB 에 두지 않고 계산한다. */
    private static final String[] DAY_OF_WEEK = {"월", "화", "수", "목", "금", "토", "일"};

    private final FunHistoryModeRepository funHistoryModeRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "historyRound", key = "'public'")
    public HistoryRoundSnapshot<FunHistoryRoundResponse> getAllRounds() {
        List<FunHistoryRoundResponse> items = funHistoryModeRepository.findAllWithRoster()
                .stream()
                .map(FunHistoryModeServiceImpl::toResponse)
                .toList();
        return HistoryRoundSnapshot.of(items);
    }

    private static FunHistoryRoundResponse toResponse(HistoryRoundEntity e) {
        int day = e.getDayNo();
        List<FunHistoryRosterResponse> roster = e.getRoster().stream()
                .map(r -> new FunHistoryRosterResponse(
                        r.getRosterGroup(), r.getOrderNo(), r.getPlayerName(),
                        r.getSeasonYear(), r.getPositionCode(), r.getLegendName()))
                .toList();

        return new FunHistoryRoundResponse(
                e.getDayNo(),
                (day + 6) / 7,                       // 1~7 → 1주차, 8~14 → 2주차
                DAY_OF_WEEK[(day - 1) % 7],
                e.getRoundNo(),
                e.getRoundLabel(),
                roster
        );
    }
}
