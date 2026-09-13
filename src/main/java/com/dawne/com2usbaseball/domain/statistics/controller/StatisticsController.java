package com.dawne.com2usbaseball.domain.statistics.controller;

import com.dawne.com2usbaseball.domain.statistics.dto.request.StatisticSupportClickRequest;
import com.dawne.com2usbaseball.domain.statistics.service.StatisticsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 홈 화면 후원(카카오페이 송금) 버튼 클릭 기록. "/api/**" 는 SecurityConfig 에서 permitAll —
 * 비로그인도 호출할 수 있지만, 로그인 유저일 때만 기록한다(JwtAuthFilter 가 쿠키 토큰을
 * 검증했으면 요청 속성 "userId" 를 채워 넣는다). 결과는 FE 가 신경 쓰지 않는
 * fire-and-forget 용도라 성공/실패 무관하게 항상 204 를 고정 반환한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @PostMapping("/support-click")
    public ResponseEntity<Void> recordSupportClick(@RequestBody(required = false) StatisticSupportClickRequest request,
                                                     HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        statisticsService.recordSupportClick(request, userId);
        return ResponseEntity.noContent().build();
    }
}
