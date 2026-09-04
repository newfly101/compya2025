package com.dawne.com2usbaseball.domain.notice.service;

import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.domain.notice.dto.request.NoticeAdminListRequest;
import com.dawne.com2usbaseball.domain.notice.dto.request.NoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;

import java.util.List;

public interface AdminNoticeService {
    List<NoticeResponse> getAdminNoticeList(NoticeAdminListRequest request);
    NoticeResponse getAdminNoticeDetail(Long noticeId);
    NoticeResponse createNotice(NoticeRequest request);
    NoticeResponse updateNotice(NoticeRequest request, Long noticeId);
    void updateNoticeVisible(Long noticeId, Boolean isVisible);
    void updateNoticePinned(Long noticeId, Boolean isPinned);
    void deleteNotice(Long noticeId);

    // 일괄 작업
    BulkOperationResponse bulkDeleteNotices(List<Long> ids);
    BulkOperationResponse bulkUpdateNoticesVisible(List<Long> ids, Boolean isVisible);

}
