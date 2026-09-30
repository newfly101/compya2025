package com.dawne.com2usbaseball.domain.event.service.support;

/** 수집 1회 결과 요약 — created 새 이벤트 초안 / updated 원문 변경 감지 / failed 실패 / coupons 새 쿠폰 */
public record CafeSyncResult(int created, int updated, int failed, int skipped, int coupons) { }
