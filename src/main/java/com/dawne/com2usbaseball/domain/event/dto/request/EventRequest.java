package com.dawne.com2usbaseball.domain.event.dto.request;

import com.dawne.com2usbaseball.domain.event.enums.EventType;

// startAt/expireAt은 프론트가 "yyyy-MM-dd"(날짜만) 또는 "yyyy-MM-dd HH:mm"(시각 포함)로 섞어 보낸다.
// LocalDateTime + @JsonFormat 고정 패턴으로는 날짜만 온 값을 파싱하지 못해 400이 나므로,
// 문자열 그대로 받아 서비스 레이어(EventAdminServiceImpl)에서 정규화한다.
public record EventRequest(
        EventType eventType,
        String title,
        String startAt,
        String expireAt,
        String imageUrl,
        String externalLink,
        boolean visible
) { }
