package com.dawne.com2usbaseball.domain.event.repository;

import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.repository.mapper.EventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class EventRepository {
    private final EventMapper mapper;

    // 카페 이벤트 등록 한 내용 반환
    public List<EventEntity> selectCafeEvents() {
        return mapper.selectEventByExternal();
    }

    // 카페 이벤트 추가
    public boolean insertCafeEvent(EventEntity event) {
        return mapper.insertEvent(event) > 0;
    }

    // 카페 이벤트 수정
    public boolean updateCafeEvent(EventEntity event) {
        return mapper.updateEventByExternal(event) > 0;
    }

    // 카페 이벤트 노출 값 수정
    public boolean updateCafeEventVisible(Long id, boolean visible) {
        return mapper.updateEventVisible(id, visible) > 0;
    }
}
