package com.dawne.com2usbaseball.domain.notice.repository;

import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import com.dawne.com2usbaseball.domain.notice.repository.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class AdminNoticeRepository {

    private final NoticeMapper noticeMapper;

    public List<NoticeEntity> getAdminNoticeList() {
        return noticeMapper.getAdminNoticeList();
    }

    public NoticeEntity getAdminNoticeDetail(Long noticeId) {
        return noticeMapper.getAdminNoticeDetail(noticeId);
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
