package com.dawne.com2usbaseball.domain.analytics.dto.response;

/** 가입 전환 유형별 건수 (conversionType: immediate|returningThenSignup) — 서비스에서 Map 으로 합친다. */
public record SignupConversionRow(String conversionType, long count) {
}
