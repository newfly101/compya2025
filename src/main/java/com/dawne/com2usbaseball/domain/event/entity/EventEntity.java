package com.dawne.com2usbaseball.domain.event.entity;

import com.dawne.com2usbaseball.domain.event.enums.EventType;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventEntity {
    Long id;
    EventType eventType;
    String title;
    LocalDateTime startAt;
    LocalDateTime expireAt;
    String imageUrl;
    String externalLink;
    boolean visible;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
