package com.dawne.com2usbaseball.domain.notice.repository;

import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;
import com.dawne.com2usbaseball.domain.notice.exception.NoticeException;
import com.dawne.com2usbaseball.domain.notice.repository.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminNoticeRepository {

    private final NoticeMapper noticeMapper;

    public List<NoticeEntity> getAdminNoticeList() {
        return noticeMapper.getAdminNoticeList();
    }

    public NoticeEntity getAdminNoticeDetail(Long noticeId) {
        NoticeEntity notice = noticeMapper.getAdminNoticeDetail(noticeId);
        if (notice == null) {
            throw new NoticeException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return notice;
    }

    public Optional<NoticeEntity> findById(Long noticeId) {
        return Optional.ofNullable(noticeMapper.selectNoticeById(noticeId));
    }

    public boolean insertNotice(NoticeEntity entity) {
        return noticeMapper.insertNotice(entity) > 0;
    }

    public boolean updateNotice(NoticeEntity entity) {
        return noticeMapper.updateNotice(entity) > 0;
    }

    public boolean updateNoticeVisible(Long noticeId, Boolean isVisible) {
        return noticeMapper.updateNoticeVisible(noticeId, isVisible) > 0;
    }

    public boolean updateNoticePinned(Long noticeId, Boolean isPinned) {
        return noticeMapper.updateNoticePinned(noticeId, isPinned) > 0;
    }

    public boolean deleteNotice(Long noticeId) {
        return noticeMapper.deleteNotice(noticeId) > 0;
    }
}
