package com.dawne.com2usbaseball.domain.analytics.dto.response;

/** 매퍼가 "이벤트 종류별 건수" 를 행 단위로 돌려줄 때 쓰는 중간 운반체 — 서비스에서 Map 으로 합친다. */
public record AnalyticsEventCountRow(String eventType, long count) {
}
