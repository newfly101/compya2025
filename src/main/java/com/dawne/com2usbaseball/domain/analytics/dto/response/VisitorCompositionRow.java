package com.dawne.com2usbaseball.domain.analytics.dto.response;

/** 매퍼가 "신규/재방문 구성" 을 행 단위로 돌려줄 때 쓰는 중간 운반체 (visitorType: new|returning) — 서비스에서 Map 으로 합친다. */
public record VisitorCompositionRow(String visitorType, long count) {
}
