package com.dawne.com2usbaseball.domain.analytics.enums;

/**
 * site_user_event.event_type 과 1:1 대응 (ENUM 상수명이 DB ENUM 값과 동일해야
 * MyBatis 기본 EnumTypeHandler 가 그대로 매핑한다).
 */
public enum AnalyticsEventType {
    PAGE_VIEW,
    CONTENT_CLICK,
    OUTBOUND_CLICK,
    SEARCH
}
