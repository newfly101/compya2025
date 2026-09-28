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
import com.dawne.com2usbaseball.common.support.cache.CacheEvictAfterCommit;
import com.dawne.com2usbaseball.common.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    @CacheEvictAfterCommit(cacheName = "events", keys = {"external::admin", "external::public"})
    public EventResponse createEvent(EventRequest request) {
        EventEntity event = eventMapStruct.toEntity(request);

        // 등록은 신규 행이라 start_at/expire_at이 DB에서 NOT NULL — 값이 없으면 바로 거절
        LocalDateTime startAt = DateTimeUtils.normalize(request.startAt(), DateTimeUtils.DEFAULT_START_TIME, EventMessages.EVENT_START_AT_INVALID_FORMAT);
        LocalDateTime expireAt = DateTimeUtils.normalize(request.expireAt(), DateTimeUtils.DEFAULT_EXPIRE_TIME, EventMessages.EVENT_EXPIRE_AT_INVALID_FORMAT);
        if (startAt == null) {
            throw new BaseException(EventMessages.EVENT_START_AT_REQUIRED, HttpStatus.BAD_REQUEST);
        }
        if (expireAt == null) {
            throw new BaseException(EventMessages.EVENT_EXPIRE_AT_REQUIRED, HttpStatus.BAD_REQUEST);
        }
        validatePeriod(startAt, expireAt);
        event.setStartAt(startAt);
        event.setExpireAt(expireAt);

        if (!repository.saveEvent(event)) {
            throw new BaseException(EventMessages.EVENT_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        EventEntity saved = repository.findById(event.getId())
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));

        return eventMapStruct.toResponse(saved);
    }

    @Override
    @CacheEvictAfterCommit(cacheName = "events", keys = {"external::admin", "external::public"})
    public EventResponse updateEvent(EventRequest request, Long id) {
        EventEntity event = repository.findById(id)
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));

        eventMapStruct.updateEntity(request, event);

        // 수정은 부분 수정 허용 — 값이 안 온 필드는 기존 값을 유지(정규화 결과가 null이면 건드리지 않음)
        // 날짜만 오면 등록과 같은 기본 시각(시작 12:00:00 / 종료 23:59:59), 시각까지 오면 그 시각 그대로.
        // 관리자 폼이 시각을 함께 보내므로(AdminEventScreen 기간 시각 입력) 덮어쓰기는 폼 쪽에서 막는다.
        LocalDateTime startAt = DateTimeUtils.normalize(request.startAt(), DateTimeUtils.DEFAULT_START_TIME, EventMessages.EVENT_START_AT_INVALID_FORMAT);
        LocalDateTime expireAt = DateTimeUtils.normalize(request.expireAt(), DateTimeUtils.DEFAULT_EXPIRE_TIME, EventMessages.EVENT_EXPIRE_AT_INVALID_FORMAT);
        if (startAt != null) {
            event.setStartAt(startAt);
        }
        if (expireAt != null) {
            event.setExpireAt(expireAt);
        }
        validatePeriod(event.getStartAt(), event.getExpireAt());

        if(!repository.updateEvent(event)) {
            throw new BaseException(EventMessages.EVENT_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return eventMapStruct.toResponse(event);
    }

    @Override
    @CacheEvictAfterCommit(cacheName = "events", keys = {"external::admin", "external::public"})
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
    @CacheEvictAfterCommit(cacheName = "events", keys = {"external::admin", "external::public"})
    public void deleteEvent(Long id) {
        repository.findById(id)
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));
        repository.deleteEvent(id);
    }

    // 일괄 삭제 — 존재하는 id만 삭제, 존재하지 않는 id는 실패 목록으로 반환(전체 롤백 X)
    @Override
    @CacheEvictAfterCommit(cacheName = "events", keys = {"external::admin", "external::public"})
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
    @CacheEvictAfterCommit(cacheName = "events", keys = {"external::admin", "external::public"})
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

    // DB의 chk_site_events_expire_after_start(expire_at > start_at) 제약을 서비스 단에서 먼저 검증 —
    // 위반 시 DB 예외로 500이 나는 대신 여기서 400으로 명확히 거절한다
    private void validatePeriod(LocalDateTime startAt, LocalDateTime expireAt) {
        if (startAt != null && expireAt != null && !expireAt.isAfter(startAt)) {
            throw new BaseException(EventMessages.EVENT_INVALID_PERIOD, HttpStatus.BAD_REQUEST);
        }
    }
}
