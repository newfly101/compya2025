package com.dawne.com2usbaseball.domain.notice.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.notice.controller.docs.NoticeSwaggerDocs;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;
import com.dawne.com2usbaseball.domain.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
public class NoticeController implements NoticeSwaggerDocs {

    private final NoticeService noticeService;

    @Override
    @GetMapping
    public GlobalResponse<List<NoticeResponse>> getNoticeList() {
        List<NoticeResponse> notice = noticeService.getNoticeList();

        return GlobalResponse.success(NoticeMessages.NOTICE_SUCCESS, notice);
    }

    @Override
    @GetMapping("/{noticeId}")
    public GlobalResponse<NoticeResponse> getNoticeDetail(@PathVariable Long noticeId) {
        NoticeResponse noticeDetail = noticeService.getNoticeDetail(noticeId);

        return GlobalResponse.success(NoticeMessages.NOTICE_DETAIL_SUCCESS, noticeDetail);
    }
}
