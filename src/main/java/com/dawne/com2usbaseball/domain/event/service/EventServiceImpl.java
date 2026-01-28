package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<EventEntity> getEventListsByExternal() {
        return repository.selectCafeEvents();
    }

    @Override
    public EventEntity createEvent(EventEntity event) {
        boolean success = repository.insertCafeEvent(event);
        if (!success) {
            throw new IllegalStateException("이벤트 생성에 실패했습니다.");
        }
        return event;
    }

    @Override
    public void updateEvent(EventEntity event) {
        boolean success = repository.updateCafeEvent(event);
        if (!success) {
            throw new IllegalStateException("이벤트 수정에 실패했습니다.");
        }
    }

    @Override
    public void updateEventVisible(Long id, boolean visible) {
        boolean success = repository.updateCafeEventVisible(id, visible);
        if (!success) {
            throw new IllegalStateException("이벤트 노출 상태 변경에 실패했습니다.");
        }
    }
}
