package com.dawne.com2usbaseball.domain.statistics.service;

import com.dawne.com2usbaseball.domain.statistics.dto.request.StatisticSupportClickRequest;

public interface StatisticsService {

    /**
     * 후원(송금) 버튼 클릭을 기록한다. userId 가 null(비로그인)이면 아무것도 하지 않는다 —
     * 비로그인도 버튼은 누를 수 있고, 그 경우 기록하지 않는 것이 스펙이다. 저장 중 예외가
     * 나도 호출자에게 전파하지 않는다 — 컨트롤러 응답은 항상 204 로 고정, 통계 실패가
     * 후원 버튼 자체의 동작에 영향을 주면 안 된다.
     */
    void recordSupportClick(StatisticSupportClickRequest request, Long userId);
}
