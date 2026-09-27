package com.dawne.com2usbaseball.domain.event.dto.request;

import com.dawne.com2usbaseball.domain.event.enums.EventType;
import jakarta.validation.constraints.Size;

// startAt/expireAt은 프론트가 "yyyy-MM-dd"(날짜만) 또는 "yyyy-MM-dd HH:mm"(시각 포함)로 섞어 보낸다.
// LocalDateTime + @JsonFormat 고정 패턴으로는 날짜만 온 값을 파싱하지 못해 400이 나므로,
// 문자열 그대로 받아 서비스 레이어(EventAdminServiceImpl)에서 정규화한다.
// 길이 상한은 site_events 컬럼 기준. PATCH 가 부분 수정이라 필수 여부는 걸지 않는다.
public record EventRequest(
        EventType eventType,
        @Size(max = 255) String title,
        String startAt,
        String expireAt,
        @Size(max = 500) String imageUrl,
        @Size(max = 500) String externalLink,
        boolean visible
) { }
