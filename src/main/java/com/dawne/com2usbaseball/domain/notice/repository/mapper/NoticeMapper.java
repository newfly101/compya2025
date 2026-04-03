package com.dawne.com2usbaseball.domain.notice.repository.mapper;

import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NoticeMapper {

    List<NoticeEntity> getNoticeList();

    NoticeEntity getNoticeDetail(@Param("id") Long noticeId);

    List<NoticeEntity> getAdminNoticeList();

    NoticeEntity getAdminNoticeDetail(@Param("id") Long noticeId);

    int insertNotice(NoticeEntity entity);

    int updateNotice(NoticeEntity entity);

    int updateNoticeVisible(@Param("id") Long noticeId,
                             @Param("isVisible") Boolean isVisible);

    int updateNoticePinned(@Param("id") Long noticeId,
                            @Param("isPinned") Boolean isPinned);

    int deleteNotice(@Param("id") Long noticeId);
}
