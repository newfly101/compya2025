package com.dawne.com2usbaseball.domain.notice.dto.request;

public record ChangeNoticeVisibleRequest(
        Long noticeId,
        Boolean isVisible
) {}
