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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EventAdminServiceImpl implements EventAdminService {

    private final EventRepository repository;
    private final EventMapStruct eventMapStruct;

    // 날짜만("yyyy-MM-dd") 오면 필드별 기본 시각을 채운다 — 시작은 12:00:00, 종료는 23:59:59
    private static final LocalTime DEFAULT_START_TIME = LocalTime.of(12, 0, 0);
    private static final LocalTime DEFAULT_EXPIRE_TIME = LocalTime.of(23, 59, 59);
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    // 초는 있어도 없어도 되게 optional 처리("[:ss]"). "yyyy-MM-dd'T'HH:mm" 형태는 T를 공백으로 치환해 흡수한다
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm[:ss]");

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

        // 등록은 신규 행이라 start_at/expire_at이 DB에서 NOT NULL — 값이 없으면 바로 거절
        LocalDateTime startAt = normalizeDateTime(request.startAt(), DEFAULT_START_TIME, EventMessages.EVENT_START_AT_INVALID_FORMAT);
        LocalDateTime expireAt = normalizeDateTime(request.expireAt(), DEFAULT_EXPIRE_TIME, EventMessages.EVENT_EXPIRE_AT_INVALID_FORMAT);
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
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public EventResponse updateEvent(EventRequest request, Long id) {
        EventEntity event = repository.findById(id)
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));

        eventMapStruct.updateEntity(request, event);

        // 수정은 부분 수정 허용 — 값이 안 온 필드는 기존 값을 유지(정규화 결과가 null이면 건드리지 않음)
        LocalDateTime startAt = normalizeDateTime(request.startAt(), DEFAULT_START_TIME, EventMessages.EVENT_START_AT_INVALID_FORMAT);
        LocalDateTime expireAt = normalizeDateTime(request.expireAt(), DEFAULT_EXPIRE_TIME, EventMessages.EVENT_EXPIRE_AT_INVALID_FORMAT);
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

    // "yyyy-MM-dd"(날짜만) / "yyyy-MM-dd HH:mm[:ss]" / "yyyy-MM-dd'T'HH:mm" 를 모두 흡수해 LocalDateTime으로 정규화한다.
    // null/빈 문자열은 "값 없음"으로 보고 null을 그대로 돌려준다 — 등록 시 필수 체크, 수정 시 부분수정 판단은 호출부 책임.
    private LocalDateTime normalizeDateTime(String raw, LocalTime defaultTime, EventMessages invalidFormatCode) {
        if (raw == null || raw.isBlank()) {
            return null;
        }

        String trimmed = raw.trim();
        try {
            if (trimmed.length() == 10) {
                return LocalDate.parse(trimmed, DATE_ONLY_FORMATTER).atTime(defaultTime);
            }
            String normalized = trimmed.replace('T', ' ');
            return LocalDateTime.parse(normalized, DATE_TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new BaseException(invalidFormatCode, HttpStatus.BAD_REQUEST);
        }
    }

    // DB의 chk_site_events_expire_after_start(expire_at > start_at) 제약을 서비스 단에서 먼저 검증 —
    // 위반 시 DB 예외로 500이 나는 대신 여기서 400으로 명확히 거절한다
    private void validatePeriod(LocalDateTime startAt, LocalDateTime expireAt) {
        if (startAt != null && expireAt != null && !expireAt.isAfter(startAt)) {
            throw new BaseException(EventMessages.EVENT_INVALID_PERIOD, HttpStatus.BAD_REQUEST);
        }
    }
}
