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
    Long sourceArticleId;      // 원문 카페 글번호 (수집 이벤트만)
    String contentHtml;        // 정제된 본문
    String contentHash;        // 마지막으로 본 원문 구간 해시
    LocalDateTime syncedAt;    // 마지막 수집 시각
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
