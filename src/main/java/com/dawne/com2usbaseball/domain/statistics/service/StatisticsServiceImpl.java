package com.dawne.com2usbaseball.domain.statistics.service;

import com.dawne.com2usbaseball.domain.statistics.dto.request.StatisticSupportClickRequest;
import com.dawne.com2usbaseball.domain.statistics.entity.StatisticSupportClickEntity;
import com.dawne.com2usbaseball.domain.statistics.repository.StatisticSupportClickRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 통계 저장이 화면(후원 버튼)에 영향을 주면 안 된다 — 이 클래스의 유일한 목적.
 * 비로그인 클릭은 애초에 insert 하지 않고, 로그인 클릭이어도 저장 중 예외는 여기서
 * 전부 흡수하고 로그만 남긴다(컨트롤러는 이미 항상 204 를 고정 반환).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private static final String DEFAULT_TARGET = "kakaopay";

    private final StatisticSupportClickRepository statisticSupportClickRepository;

    @Override
    @Transactional
    public void recordSupportClick(StatisticSupportClickRequest request, Long userId) {
        if (userId == null) {
            // 비로그인 클릭 — 스펙상 기록하지 않는다 (에러도 아님)
            return;
        }

        String target = resolveTarget(request);

        StatisticSupportClickEntity entity = StatisticSupportClickEntity.builder()
                .userId(userId)
                .target(target)
                .createdAt(LocalDateTime.now())
                .build();

        try {
            statisticSupportClickRepository.insert(entity);
        } catch (Exception e) {
            log.error("[STATISTICS] 후원 클릭 기록 실패 (userId={}, target={}): {}", userId, target, e.getMessage(), e);
        }
    }

    private String resolveTarget(StatisticSupportClickRequest request) {
        if (request == null || request.target() == null || request.target().isBlank()) {
            return DEFAULT_TARGET;
        }
        return request.target();
    }
}
