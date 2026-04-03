package com.dawne.com2usbaseball.domain.notice.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.notice.controller.docs.NoticeSwaggerDocs;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
public class NoticeController implements NoticeSwaggerDocs {

    private final NoticeService noticeService;

    @Override
    @GetMapping
    public ListResponse<NoticeResponse> getNoticeList() {
        return noticeService.getNoticeList();
    }

    @Override
    @GetMapping("/{noticeId}")
    public NoticeResponse getNoticeDetail(@PathVariable Long noticeId) {
        return noticeService.getNoticeDetail(noticeId);
    }
}
