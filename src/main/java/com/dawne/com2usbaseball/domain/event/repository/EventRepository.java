package com.dawne.com2usbaseball.domain.event.repository;

import com.dawne.com2usbaseball.domain.event.dto.request.EventAdminListRequest;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.repository.mapper.EventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EventRepository {
    private final EventMapper mapper;

    // public
    public List<EventEntity> findExternalEventsForUser() {
        return mapper.selectEventByExternalForUser();
    }

    // admin

    public List<EventEntity> findExternalEvents() {
        return mapper.selectEventByExternal();
    }

    public Optional<EventEntity> findById(Long id) {
        return Optional.ofNullable(mapper.selectEventById(id));
    }

    // 카페 이벤트 추가
    public boolean saveEvent(EventEntity event) {
        return mapper.insertEvent(event) > 0;
    }


    // 카페 이벤트 수정
    public boolean updateEvent(EventEntity event) {
        return mapper.updateEventByExternal(event) > 0;
    }

    // 카페 이벤트 노출 값 수정
    public boolean updateEventVisible(Long id, boolean visible) {
        return mapper.updateEventVisible(id, visible) > 0;
    }

    // 관리자 전체 목록 (동적 필터)
    public List<EventEntity> findAdminEventList(EventAdminListRequest req) {
        return mapper.selectAdminEventList(req.eventType(), req.visible(), req.size(), req.offset());
    }

    // 이벤트 삭제
    public boolean deleteEvent(Long id) {
        return mapper.deleteEventById(id) > 0;
    }
}
