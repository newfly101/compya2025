package com.dawne.com2usbaseball.domain.analytics.entity;

import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsEventType;
import lombok.*;

import java.time.LocalDate;

/**
 * site_user_event_daily 1행.
 *
 * ⚠️ pagePath/contentType/contentId 는 PRIMARY KEY 구성요소라 DB가 NOT NULL DEFAULT ''.
 * 이 엔티티로 값을 세팅할 때 반드시 빈 문자열("")을 넣어야 한다 — NULL 을 세팅하면
 * PK NOT NULL 제약 위반으로 INSERT 가 실패한다(01_site.sql:220-226 주석 참고).
 * 실제 집계 INSERT 는 AnalyticsEventDailyMapper.xml 의 INSERT ... SELECT 로 처리하며
 * 이 엔티티는 값을 담아 나르는 용도로만 쓰인다.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsEventDailyEntity {
    private LocalDate eventDate;
    private AnalyticsEventType eventType;
    private String pagePath;
    private String contentType;
    private String contentId;
    private long eventCount;
    private long uniqueAnonCount;
    private long uniqueUserCount;
}
