package com.dawne.com2usbaseball.domain.analytics.service;

import com.dawne.com2usbaseball.domain.analytics.dto.AnalyticsClientContext;
import com.dawne.com2usbaseball.domain.analytics.dto.request.AnalyticsEventItemRequest;
import com.dawne.com2usbaseball.domain.analytics.dto.request.AnalyticsEventRequest;
import com.dawne.com2usbaseball.domain.analytics.entity.AnalyticsEventEntity;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsEventType;
import com.dawne.com2usbaseball.domain.analytics.repository.AnalyticsEventRepository;
import com.dawne.com2usbaseball.domain.analytics.service.support.AnalyticsEventGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/**
 * 수집이 서비스를 망치면 안 된다 — 이 클래스의 유일한 목적.
 *  1) @Async 로 요청 스레드와 분리 (전용 풀은 config.AsyncConfig 참고)
 *  2) DB 저장 실패는 여기서 전부 흡수하고 로그만 남긴다
 *  3) 봇 UA 는 통째로 버린다
 *  4) 형식이 이상한 개별 값(anonId 미형식, eventType 4종 밖)은 그 이벤트만 버리고
 *     나머지는 계속 저장한다 — 요청 전체를 실패시키지 않는다
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsEventServiceImpl implements AnalyticsEventService {

    private final AnalyticsEventRepository analyticsEventRepository;

    @Override
    @Async("analyticsEventExecutor")
    public void collect(AnalyticsEventRequest request, AnalyticsClientContext context) {
        try {
            doCollect(request, context);
        } catch (Exception e) {
            // 어떤 예외가 나도 여기서 끝낸다 — 이미 컨트롤러는 응답을 돌려준 뒤라
            // 전파할 대상 자체가 없다. 진단을 위해 로그만 남긴다.
            log.error("[ANALYTICS] 이벤트 수집 처리 중 예외: {}", e.getMessage(), e);
        }
    }

    private void doCollect(AnalyticsEventRequest request, AnalyticsClientContext context) {
        if (request == null || request.events() == null || request.events().isEmpty()) {
            return;
        }
        if (AnalyticsEventGuard.isBot(context.userAgent())) {
            return;
        }

        List<AnalyticsEventItemRequest> items = request.events();
        int limit = Math.min(items.size(), AnalyticsEventGuard.MAX_EVENTS_PER_REQUEST);

        List<AnalyticsEventEntity> entities = new ArrayList<>(limit);
        for (int i = 0; i < limit; i++) {
            AnalyticsEventEntity entity = toEntity(items.get(i), context);
            if (entity != null) {
                entities.add(entity);
            }
        }

        if (entities.isEmpty()) {
            return;
        }

        try {
            analyticsEventRepository.insertAll(entities);
        } catch (Exception e) {
            log.error("[ANALYTICS] 이벤트 저장 실패 ({}건 시도): {}", entities.size(), e.getMessage(), e);
        }
    }

    /** 개별 이벤트가 이상하면 null 을 반환한다 — 호출부가 그 이벤트만 건너뛴다. */
    private AnalyticsEventEntity toEntity(AnalyticsEventItemRequest item, AnalyticsClientContext context) {
        if (item == null) {
            return null;
        }

        AnalyticsEventType eventType = parseEventType(item.eventType());
        if (eventType == null) {
            return null;
        }
        if (!AnalyticsEventGuard.isValidUuid(item.anonId())) {
            return null;
        }

        String pagePath = AnalyticsEventGuard.truncate(item.pagePath(), AnalyticsEventGuard.PAGE_PATH_MAX_LENGTH);
        if (pagePath == null || pagePath.isBlank()) {
            return null;
        }

        return AnalyticsEventEntity.builder()
                .eventType(eventType)
                .anonId(item.anonId())
                .userId(context.userId())
                .pagePath(pagePath)
                .contentType(AnalyticsEventGuard.truncate(item.contentType(), AnalyticsEventGuard.CONTENT_TYPE_MAX_LENGTH))
                .contentId(AnalyticsEventGuard.truncate(item.contentId(), AnalyticsEventGuard.CONTENT_ID_MAX_LENGTH))
                .targetUrl(AnalyticsEventGuard.truncate(item.targetUrl(), AnalyticsEventGuard.TARGET_URL_MAX_LENGTH))
                .searchKeyword(AnalyticsEventGuard.truncate(item.searchKeyword(), AnalyticsEventGuard.SEARCH_KEYWORD_MAX_LENGTH))
                .referrer(AnalyticsEventGuard.truncate(item.referrer(), AnalyticsEventGuard.REFERRER_MAX_LENGTH))
                .country(AnalyticsEventGuard.truncate(context.country(), AnalyticsEventGuard.COUNTRY_MAX_LENGTH))
                .userAgent(AnalyticsEventGuard.truncate(context.userAgent(), AnalyticsEventGuard.USER_AGENT_MAX_LENGTH))
                .createdAt(parseOccurredAt(item.occurredAt()))
                .build();
    }

    private AnalyticsEventType parseEventType(String raw) {
        if (raw == null) {
            return null;
        }
        try {
            return AnalyticsEventType.valueOf(raw);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * 클라이언트가 보낸 발생 시각을 서버 시간대로 변환해 created_at 으로 쓴다.
     * 값이 없거나 형식이 이상하면(파싱 실패) 예외를 던지지 않고 서버 수신 시각으로 대체한다
     * — 시각 하나 때문에 정상 이벤트를 통째로 버릴 이유가 없다.
     */
    private LocalDateTime parseOccurredAt(String raw) {
        if (raw == null || raw.isBlank()) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.ofInstant(Instant.parse(raw), ZoneId.systemDefault());
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}
