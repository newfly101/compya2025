package com.dawne.com2usbaseball.domain.event.dto.response;

import com.dawne.com2usbaseball.domain.event.enums.EventType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        EventType eventType,
        String title,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime startAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime expireAt,
        String imageUrl,
        String externalLink,
        boolean visible
) { }
