package com.dawne.com2usbaseball.domain.notice.repository;

import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeSource;
import com.dawne.com2usbaseball.domain.notice.repository.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;
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

    public List<NoticeEntity> getAdminNoticeListFiltered(NoticeSource source, Boolean isVisible, Boolean isPinned) {
        return noticeMapper.getAdminNoticeListFiltered(source, isVisible, isPinned);
    }

    public Optional<NoticeEntity> getAdminNoticeDetail(Long noticeId) {
        return Optional.ofNullable(noticeMapper.getAdminNoticeDetail(noticeId));
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

    // 일괄 작업
    public List<Long> selectExistingIds(List<Long> ids) {
        return noticeMapper.selectExistingNoticeIds(ids);
    }

    public void deleteNoticesByIds(List<Long> ids) {
        noticeMapper.deleteNoticesByIds(ids);
    }

    public void updateNoticesVisibleByIds(List<Long> ids, Boolean isVisible) {
        noticeMapper.updateNoticesVisibleByIds(ids, isVisible);
    }
}
