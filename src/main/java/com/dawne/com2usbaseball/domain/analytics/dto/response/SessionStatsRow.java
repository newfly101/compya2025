package com.dawne.com2usbaseball.domain.analytics.dto.response;

/** 기간 합산 세션 수·페이지뷰 수 — 세션당 페이지뷰 계산의 원료(서비스에서 나눈다). */
public record SessionStatsRow(long sessionCount, long pageViewCount) {
}
