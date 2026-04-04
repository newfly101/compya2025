package com.dawne.com2usbaseball.domain.notice.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.notice.controller.docs.AdminNoticeSwaggerDocs;
import com.dawne.com2usbaseball.domain.notice.dto.request.NoticePinnedRequest;
import com.dawne.com2usbaseball.domain.notice.dto.request.NoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.request.NoticeVisibleRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;
import com.dawne.com2usbaseball.domain.notice.service.AdminNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/notices")
public class AdminNoticeController implements AdminNoticeSwaggerDocs {

    private final AdminNoticeService adminNoticeService;

    @Override
    @GetMapping
    public GlobalResponse<List<NoticeResponse>> getAdminNoticeList() {
        List<NoticeResponse> noticeList = adminNoticeService.getAdminNoticeList();

        return GlobalResponse.success(NoticeMessages.NOTICE_SUCCESS, noticeList);
    }

    @Override
    @GetMapping("/{noticeId}")
    public GlobalResponse<NoticeResponse> getAdminNoticeDetail(@PathVariable Long noticeId) {
        NoticeResponse noticeDetail = adminNoticeService.getAdminNoticeDetail(noticeId);

        return GlobalResponse.success(NoticeMessages.NOTICE_DETAIL_SUCCESS, noticeDetail);
    }

    @Override
    @PostMapping
    public GlobalResponse<NoticeResponse> createNotice(
            @RequestBody NoticeRequest request
    ) {
        NoticeResponse newNotice = adminNoticeService.createNotice(request);
        return GlobalResponse.success(NoticeMessages.NOTICE_CREATED, newNotice);
    }

    @Override
    @PutMapping("/{noticeId}")
    public GlobalResponse<NoticeResponse> updateNotice(
            @PathVariable Long noticeId,
            @RequestBody NoticeRequest request
    ) {
        NoticeResponse updatedNotice = adminNoticeService.updateNotice(request, noticeId);
        return GlobalResponse.success(NoticeMessages.NOTICE_UPDATED, updatedNotice);
    }

    @Override
    @PatchMapping("/{noticeId}/visible")
    public GlobalResponse<Void> updateNoticeVisible(
            @PathVariable Long noticeId,
            @RequestBody NoticeVisibleRequest request
    ) {
        adminNoticeService.updateNoticeVisible(noticeId, request.isVisible());
        return GlobalResponse.success(NoticeMessages.NOTICE_VISIBLE_UPDATED, null);
    }

    @Override
    @PatchMapping("/{noticeId}/pinned")
    public GlobalResponse<Void> updateNoticePinned(
            @PathVariable Long noticeId,
            @RequestBody NoticePinnedRequest request
    ) {
        adminNoticeService.updateNoticePinned(noticeId, request.isPinned());
        return GlobalResponse.success(NoticeMessages.NOTICE_PINNED_UPDATED, null);
    }

    @Override
    @DeleteMapping("/{noticeId}")
    public GlobalResponse<Void> deleteNotice(@PathVariable Long noticeId) {
        adminNoticeService.deleteNotice(noticeId);
        return GlobalResponse.success(NoticeMessages.NOTICE_DELETED, null);
    }

}
