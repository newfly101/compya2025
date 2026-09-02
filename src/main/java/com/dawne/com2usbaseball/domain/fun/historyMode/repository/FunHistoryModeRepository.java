package com.dawne.com2usbaseball.domain.fun.historyMode.repository;

import com.dawne.com2usbaseball.domain.fun.historyMode.entity.HistoryRoundEntity;
import com.dawne.com2usbaseball.domain.fun.historyMode.repository.mapper.FunHistoryModeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FunHistoryModeRepository {

    private final FunHistoryModeMapper historyModeMapper;

    public List<HistoryRoundEntity> findAllWithRoster() {
        return historyModeMapper.findAllWithRoster();
    }
}
