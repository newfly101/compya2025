package com.dawne.com2usbaseball.domain.notice.service;

import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;

import java.util.List;

public interface NoticeService {
    List<NoticeResponse> getNoticeList();

    NoticeResponse getNoticeDetail(Long noticeId);
}
