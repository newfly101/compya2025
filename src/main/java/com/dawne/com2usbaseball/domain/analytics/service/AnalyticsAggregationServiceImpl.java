package com.dawne.com2usbaseball.domain.analytics.service;

import com.dawne.com2usbaseball.domain.analytics.repository.AnalyticsEventDailyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * 매일 새벽 03:30(KST) 전날치를 집계한다. 수집 파이프라인과 같은 원칙 —
 * 배치 실패가 서비스에 영향을 주면 안 되므로 실패해도 throw 하지 않고 로그만 남긴다
 * (config.AsyncConfig 의 비동기 수집 예외 처리 주석 참고).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsAggregationServiceImpl implements AnalyticsAggregationService {

    private final AnalyticsEventDailyRepository analyticsEventDailyRepository;

    @Scheduled(cron = "0 30 3 * * *", zone = "Asia/Seoul")
    public void runDailyAggregation() {
        LocalDate yesterday = LocalDate.now(ZoneId.of("Asia/Seoul")).minusDays(1);
        try {
            aggregateDailyEvents(yesterday);
        } catch (Exception e) {
            log.error("[ANALYTICS] 일별 집계 배치 실패 (date={}): {}", yesterday, e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void aggregateDailyEvents(LocalDate date) {
        analyticsEventDailyRepository.aggregatePageEvents(date);
        analyticsEventDailyRepository.aggregateContentEvents(date);
        analyticsEventDailyRepository.aggregateDeviceDaily(date);
        analyticsEventDailyRepository.aggregateSessionDaily(date);
        analyticsEventDailyRepository.aggregateReferrerDaily(date);
    }
}
