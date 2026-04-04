package com.dawne.com2usbaseball.domain.notice.repository.mapper;

import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NoticeMapper {

    // Public
    List<NoticeEntity> getNoticeList();
    NoticeEntity getNoticeDetail(@Param("id") Long noticeId);

    // Admin
    List<NoticeEntity> getAdminNoticeList();
    NoticeEntity getAdminNoticeDetail(@Param("id") Long noticeId);

    // 공통 단건 조회 (insert 후 반환용)
    NoticeEntity selectNoticeById(@Param("id") Long noticeId);

    // CUD
    int insertNotice(NoticeEntity entity);
    int updateNotice(NoticeEntity entity);
    int updateNoticeVisible(@Param("id") Long noticeId, @Param("isVisible") Boolean isVisible);
    int updateNoticePinned(@Param("id") Long noticeId, @Param("isPinned") Boolean isPinned);
    int deleteNotice(@Param("id") Long noticeId);
}
