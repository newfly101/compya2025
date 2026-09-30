package com.dawne.com2usbaseball.domain.analytics.dto.response;

/** trend 엔드포인트 한 점. bucket 은 granularity=day 면 "yyyy-MM-dd", hour 면 "00".."23". */
public record AnalyticsTrendPointResponse(String bucket, long uniqueVisitors, long pageViews) {
}
