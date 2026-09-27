package com.dawne.com2usbaseball.domain.notice.dto.request;

import com.dawne.com2usbaseball.domain.notice.enums.NoticeSource;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

// 길이 상한은 site_notices 컬럼 기준(summary/content 는 TEXT·LONGTEXT 라 상한 없음).
// PUT 이 부분 수정을 허용하므로 필수 여부는 걸지 않는다.
public record NoticeRequest(
        NoticeSource source,
        @Size(max = 255) String title,
        String summary,
        String content,
        @Size(max = 500) String externalUrl,
        @Size(max = 500) String imageUrl,
        Boolean isVisible,
        Boolean isPinned,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime publishedAt
) {}
