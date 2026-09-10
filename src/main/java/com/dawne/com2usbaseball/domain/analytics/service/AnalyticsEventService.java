package com.dawne.com2usbaseball.domain.analytics.service;

import com.dawne.com2usbaseball.domain.analytics.dto.AnalyticsClientContext;
import com.dawne.com2usbaseball.domain.analytics.dto.request.AnalyticsEventRequest;

public interface AnalyticsEventService {

    /**
     * 수집 이벤트를 비동기로 저장한다. 이 메서드는 실패해도 절대 호출자에게 예외를
     * 전파하지 않는다 — 컨트롤러는 항상 응답을 먼저 돌려준 뒤이므로 실질적으로
     * 예외를 전파할 대상도 없다. context 는 요청 스레드에서 미리 뽑아둔 값이다
     * (HttpServletRequest 자체를 비동기 메서드로 넘기지 않는다).
     */
    void collect(AnalyticsEventRequest request, AnalyticsClientContext context);
}
