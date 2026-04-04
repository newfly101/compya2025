package com.dawne.com2usbaseball.domain.notice.repository;

import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;
import com.dawne.com2usbaseball.domain.notice.exception.NoticeException;
import com.dawne.com2usbaseball.domain.notice.repository.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class NoticeRepository {

    private final NoticeMapper noticeMapper;

    public List<NoticeEntity> getNoticeList() {
        return noticeMapper.getNoticeList();
    }

    public NoticeEntity getNoticeDetail(Long noticeId) {
        NoticeEntity notice = noticeMapper.getNoticeDetail(noticeId);
        if (notice == null) {
            throw new NoticeException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return notice;
    }

}
