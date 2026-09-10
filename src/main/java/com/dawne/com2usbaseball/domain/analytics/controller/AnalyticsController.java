package com.dawne.com2usbaseball.domain.analytics.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.util.ClientInfoExtractor;
import com.dawne.com2usbaseball.domain.analytics.dto.AnalyticsClientContext;
import com.dawne.com2usbaseball.domain.analytics.dto.request.AnalyticsEventRequest;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsMessages;
import com.dawne.com2usbaseball.domain.analytics.service.AnalyticsEventService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 사용자 행동 이벤트 수집. 인증 불필요(비회원이 수집 대상의 다수) — SecurityConfig 의
 * "/api/**" permitAll 에 이미 포함돼 별도 설정이 필요 없다.
 *
 * 요청을 받자마자 값만 뽑아 서비스에 넘기고 바로 202 를 돌려준다. 실제 저장은
 * AnalyticsEventServiceImpl 이 전용 스레드풀에서 비동기로 처리하며, 그 결과(성공/실패)는
 * 이 응답에 전혀 영향을 주지 않는다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsEventService analyticsEventService;

    @PostMapping("/events")
    public ResponseEntity<GlobalResponse<Void>> collect(@RequestBody(required = false) AnalyticsEventRequest request,
                                                          HttpServletRequest httpRequest) {
        AnalyticsClientContext context = new AnalyticsClientContext(
                (Long) httpRequest.getAttribute("userId"),
                ClientInfoExtractor.getCountry(httpRequest),
                httpRequest.getHeader("User-Agent") // isBot() 의 null/공백 판정을 위해 safe() 미적용(원문 그대로 전달)
        );

        analyticsEventService.collect(request, context);

        GlobalResponse<Void> body = GlobalResponse.success(AnalyticsMessages.ANALYTICS_EVENT_ACCEPTED, null);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(body);
    }
}
