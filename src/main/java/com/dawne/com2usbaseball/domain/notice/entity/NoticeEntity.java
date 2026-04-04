package com.dawne.com2usbaseball.domain.notice.entity;

import com.dawne.com2usbaseball.domain.notice.enums.NoticeSource;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoticeEntity {
    private Long id;
    private NoticeSource source;
    private String title;
    private String summary;
    private String content;
    private String externalUrl;
    private String imageUrl;
    private Boolean isVisible;
    private Boolean isPinned;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
