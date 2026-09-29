package com.dawne.com2usbaseball.domain.event.repository.mapper;

import com.dawne.com2usbaseball.domain.event.dto.request.EventAdminListRequest;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.enums.EventType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EventMapper {

    // user
    List<EventEntity> selectEventByExternalForUser();

    // admin
    List<EventEntity> selectEventByExternal();                  // 이벤트 리스트 확인 (기존 — external only)
    List<EventEntity> selectAdminEventList(
            @Param("eventType") EventType eventType,
            @Param("visible") Boolean visible,
            @Param("collected") Boolean collected,
            @Param("limit") int limit,
            @Param("offset") int offset);                       // 전체 목록 (필터)
    int insertEvent(EventEntity event);                         // 이벤트 추가
    EventEntity selectEventById(Long id);
    int updateEventByExternal(EventEntity event);               // 이벤트 수정
    int updateEventVisible(
            @Param("id") Long id,
            @Param("visible") boolean visible);                 // 이벤트 노출 값 수정
    int deleteEventById(@Param("id") Long id);                  // 이벤트 삭제 (hard delete)

    // 카페 자동 수집
    List<Long> selectExistingSourceArticleIds(@Param("ids") List<Long> ids);
    List<EventEntity> selectTrackedCollectedEvents();           // 마감 전 수집 이벤트 (재확인 대상)
    int updateCollectedContent(
            @Param("id") Long id,
            @Param("contentHtml") String contentHtml,
            @Param("contentHash") String contentHash,
            @Param("imageUrl") String imageUrl);                // 본문·해시 반영 (본문 갱신)
    int updateCollectedHash(
            @Param("id") Long id,
            @Param("contentHash") String contentHash);          // 원문 변경 표시용 — 본문은 그대로

    // 일괄 작업
    List<Long> selectExistingEventIds(@Param("ids") List<Long> ids);
    int deleteEventsByIds(@Param("ids") List<Long> ids);
    int updateEventsVisibleByIds(
            @Param("ids") List<Long> ids,
            @Param("visible") boolean visible);

}
