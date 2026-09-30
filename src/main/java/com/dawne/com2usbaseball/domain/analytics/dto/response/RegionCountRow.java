package com.dawne.com2usbaseball.domain.analytics.dto.response;

/** 매퍼가 "지역별 순방문자 수"(상위 10 + 나머지 합산 "기타")를 행 단위로 돌려줄 때 쓰는 중간 운반체. */
public record RegionCountRow(String region, long count) {
}
