package com.dawne.com2usbaseball.domain.analytics.entity;

import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsEventType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * site_user_event 1행. MyBatis 가 setter 로 채우므로 record 로 만들 수 없다.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsEventEntity {
    private AnalyticsEventType eventType;
    private String anonId;
    private Long userId;
    private String pagePath;
    private String contentType;
    private String contentId;
    private String targetUrl;
    private String searchKeyword;
    private String referrer;
    private String country;
    private String userAgent;
    private String sessionId;
    private String navType;
    private Integer screenW;
    private String deviceType;
    private String os;
    private String browser;
    private Long itemId;
    private LocalDateTime createdAt;
}
