package com.dawne.com2usbaseball.domain.notice.dto.request;

public record ChangeNoticePinnedRequest(
        Long noticeId,
        Boolean isPinned
) {}
