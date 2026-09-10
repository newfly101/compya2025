package com.dawne.com2usbaseball.domain.analytics.dto;

/**
 * 요청 스레드에서 먼저 뽑아둔 클라이언트 정보. HttpServletRequest 자체는 넘기지 않는다 —
 * 컨테이너가 요청 처리가 끝나면 request 객체를 재사용/무효화할 수 있어, @Async 로 다른
 * 스레드에서 뒤늦게 request 를 건드리면 값이 비거나 예외가 날 수 있기 때문이다.
 */
public record AnalyticsClientContext(
        Long userId,
        String country,
        String userAgent
) {
}
