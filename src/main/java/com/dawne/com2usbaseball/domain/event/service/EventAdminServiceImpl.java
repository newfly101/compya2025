package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.domain.event.dto.mapstruct.EventMapStruct;
import com.dawne.com2usbaseball.domain.event.dto.request.EventAdminListRequest;
import com.dawne.com2usbaseball.domain.event.dto.request.EventRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EventAdminServiceImpl implements EventAdminService {

    private final EventRepository repository;
    private final EventMapStruct eventMapStruct;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "events", key = "'external::admin'")
    public List<EventResponse> getExternalEventList() {
        List<EventEntity> events = repository.findExternalEvents();

        return eventMapStruct.toResponseList(events);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public EventResponse createEvent(EventRequest request) {
        EventEntity event = eventMapStruct.toEntity(request);

        if (!repository.saveEvent(event)) {
            throw new BaseException(EventMessages.EVENT_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        EventEntity saved = repository.findById(event.getId())
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));

        return eventMapStruct.toResponse(saved);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public EventResponse updateEvent(EventRequest request, Long id) {
        EventEntity event = repository.findById(id)
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));

        eventMapStruct.updateEntity(request, event);

        if(!repository.updateEvent(event)) {
            throw new BaseException(EventMessages.EVENT_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return eventMapStruct.toResponse(event);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public void updateEventVisible(Long id, boolean visible) {
        repository.findById(id)
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));

        repository.updateEventVisible(id, visible);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getAdminEventList(EventAdminListRequest request) {
        List<EventEntity> events = repository.findAdminEventList(request);
        return eventMapStruct.toResponseList(events);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public void deleteEvent(Long id) {
        repository.findById(id)
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));
        repository.deleteEvent(id);
    }

    // 일괄 삭제 — 존재하는 id만 삭제, 존재하지 않는 id는 실패 목록으로 반환(전체 롤백 X)
    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public BulkOperationResponse bulkDeleteEvents(List<Long> ids) {
        List<Long> requestedIds = normalizeIds(ids);
        if (requestedIds.isEmpty()) {
            return BulkOperationResponse.empty();
        }

        List<Long> existingIds = repository.selectExistingIds(requestedIds);
        List<Long> failedIds = requestedIds.stream().filter(id -> !existingIds.contains(id)).toList();

        if (!existingIds.isEmpty()) {
            repository.deleteEventsByIds(existingIds);
        }
        return BulkOperationResponse.of(existingIds, failedIds);
    }

    // 일괄 노출 여부 변경 — 위와 동일한 부분 실패 처리 방식
    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public BulkOperationResponse bulkUpdateEventsVisible(List<Long> ids, boolean visible) {
        List<Long> requestedIds = normalizeIds(ids);
        if (requestedIds.isEmpty()) {
            return BulkOperationResponse.empty();
        }

        List<Long> existingIds = repository.selectExistingIds(requestedIds);
        List<Long> failedIds = requestedIds.stream().filter(id -> !existingIds.contains(id)).toList();

        if (!existingIds.isEmpty()) {
            repository.updateEventsVisibleByIds(existingIds, visible);
        }
        return BulkOperationResponse.of(existingIds, failedIds);
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return ids.stream().filter(java.util.Objects::nonNull).distinct().toList();
    }
}
