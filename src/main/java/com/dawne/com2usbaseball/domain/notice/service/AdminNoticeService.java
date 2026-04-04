package com.dawne.com2usbaseball.domain.notice.service;

import com.dawne.com2usbaseball.domain.notice.dto.request.NoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;

import java.util.List;

public interface AdminNoticeService {
    List<NoticeResponse> getAdminNoticeList();
    NoticeResponse getAdminNoticeDetail(Long noticeId);
    NoticeResponse createNotice(NoticeRequest request);
    NoticeResponse updateNotice(NoticeRequest request, Long noticeId);
    void updateNoticeVisible(Long noticeId, Boolean isVisible);
    void updateNoticePinned(Long noticeId, Boolean isPinned);
    void deleteNotice(Long noticeId);

}
