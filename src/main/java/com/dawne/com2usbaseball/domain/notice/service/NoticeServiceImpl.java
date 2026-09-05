package com.dawne.com2usbaseball.domain.notice.service;

import com.dawne.com2usbaseball.domain.notice.dto.mapstruct.NoticeMapStruct;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import com.dawne.com2usbaseball.domain.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeServiceImpl implements NoticeService{

    private final NoticeRepository noticeRepository;
    private final NoticeMapStruct noticeMapStruct;

    @Override
    @Cacheable(value = "notice", key = "'public'")
    public List<NoticeResponse> getNoticeList() {
        List<NoticeEntity> notices = noticeRepository.getNoticeList();
        return noticeMapStruct.toResponseList(notices);
    }

    @Override
    @Cacheable(value = "noticeDetail", key = "#noticeId + '_public'")
    public NoticeResponse getNoticeDetail(Long noticeId) {
        NoticeEntity notice = noticeRepository.getNoticeDetail(noticeId);
        return noticeMapStruct.toResponse(notice);
    }
}
