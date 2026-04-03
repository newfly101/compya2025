package com.dawne.com2usbaseball.domain.notice.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.notice.dto.request.ChangeNoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;

public interface AdminNoticeService {
    ListResponse<NoticeResponse> getAdminNoticeList();
    NoticeResponse getAdminNoticeDetail(Long noticeId);
    OperationResponse<NoticeMessages> createNotice(ChangeNoticeRequest request);
    OperationResponse<NoticeMessages> updateNotice(ChangeNoticeRequest request,Long noticeId);
    OperationResponse<NoticeMessages> updateNoticeVisible(Long noticeId, Boolean isVisible);
    OperationResponse<NoticeMessages> updateNoticePinned(Long noticeId, Boolean isPinned);
    OperationResponse<NoticeMessages> deleteNotice(Long noticeId);

}
