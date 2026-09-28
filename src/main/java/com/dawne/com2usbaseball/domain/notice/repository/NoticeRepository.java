package com.dawne.com2usbaseball.domain.notice.repository;

import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import com.dawne.com2usbaseball.domain.notice.repository.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NoticeRepository {

    private final NoticeMapper noticeMapper;

    public List<NoticeEntity> getNoticeList() {
        return noticeMapper.getNoticeList();
    }

    public Optional<NoticeEntity> getNoticeDetail(Long noticeId) {
        return Optional.ofNullable(noticeMapper.getNoticeDetail(noticeId));
    }

}
