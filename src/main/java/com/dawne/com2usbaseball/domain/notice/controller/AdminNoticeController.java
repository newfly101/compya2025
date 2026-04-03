package com.dawne.com2usbaseball.domain.notice.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.notice.controller.docs.AdminNoticeSwaggerDocs;
import com.dawne.com2usbaseball.domain.notice.dto.request.ChangeNoticePinnedRequest;
import com.dawne.com2usbaseball.domain.notice.dto.request.ChangeNoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.request.ChangeNoticeVisibleRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;
import com.dawne.com2usbaseball.domain.notice.service.AdminNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/notices")
public class AdminNoticeController implements AdminNoticeSwaggerDocs {

    private final AdminNoticeService adminNoticeService;

    @Override
    @GetMapping
    public ListResponse<NoticeResponse> getAdminNoticeList() {
        return adminNoticeService.getAdminNoticeList();
    }

    @Override
    @GetMapping("/{noticeId}")
    public NoticeResponse getAdminNoticeDetail(@PathVariable Long noticeId) {
        return adminNoticeService.getAdminNoticeDetail(noticeId);
    }

    @Override
    @PostMapping
    public OperationResponse<NoticeMessages> createNotice(
            @RequestBody ChangeNoticeRequest request
    ) {
        return adminNoticeService.createNotice(request);
    }

    @Override
    @PutMapping("/{noticeId}")
    public OperationResponse<NoticeMessages> updateNotice(
            @PathVariable Long noticeId,
            @RequestBody ChangeNoticeRequest request
    ) {
        return adminNoticeService.updateNotice(request, noticeId);
    }

    @Override
    @PatchMapping("/{noticeId}/visible")
    public OperationResponse<NoticeMessages> updateNoticeVisible(
            @PathVariable Long noticeId,
            @RequestBody ChangeNoticeVisibleRequest request
    ) {
        return adminNoticeService.updateNoticeVisible(noticeId, request.isVisible());
    }

    @Override
    @PatchMapping("/{noticeId}/pinned")
    public OperationResponse<NoticeMessages> updateNoticePinned(
            @PathVariable Long noticeId,
            @RequestBody ChangeNoticePinnedRequest request
    ) {
        return adminNoticeService.updateNoticePinned(noticeId, request.isPinned());
    }

    @Override
    @DeleteMapping("/{noticeId}")
    public OperationResponse<NoticeMessages> deleteNotice(@PathVariable Long noticeId) {
        return adminNoticeService.deleteNotice(noticeId);
    }

}
