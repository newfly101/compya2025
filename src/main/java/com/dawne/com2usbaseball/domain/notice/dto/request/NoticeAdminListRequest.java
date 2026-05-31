package com.dawne.com2usbaseball.domain.notice.dto.request;

import com.dawne.com2usbaseball.domain.notice.enums.NoticeSource;

public record NoticeAdminListRequest(
        NoticeSource source,
        Boolean isVisible,
        Boolean isPinned
) {
}
