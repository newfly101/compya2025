package com.dawne.com2usbaseball.domain.notice.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;

public interface NoticeService {
    ListResponse<NoticeResponse> getNoticeList();

    NoticeResponse getNoticeDetail(Long noticeId);
}
