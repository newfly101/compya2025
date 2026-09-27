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
 * 조회 전용. 캐시(historyRound) 무효화 경로는 있다 — 어드민 "캐시 동기화" 화면에서
 * {@code POST /api/admin/cache-sync/historyRound/sync}(또는 sync-all)를 눌러야 비워지고
 * 곧바로 이 서비스로 다시 채워진다({@code CacheSyncServiceImpl}). TTL 이 없어(spring.cache.type=simple)
 * SQL 로 라운드·로스터를 직접 고쳤다면 이 버튼이 갱신의 유일한 수단이다 — 누르지 않으면 옛 값이 영구히 남는다.
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
