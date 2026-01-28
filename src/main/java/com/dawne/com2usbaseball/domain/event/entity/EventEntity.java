package com.dawne.com2usbaseball.domain.event.entity;

import com.dawne.com2usbaseball.domain.event.enums.EventSource;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventEntity {
    Long id;
    EventSource eventSource;
    String title;
    LocalDateTime startAt;
    LocalDateTime expireAt;
    String imageUrl;
    String externalLink;
    boolean visible;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
