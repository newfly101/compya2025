package com.dawne.com2usbaseball.domain.notice.service;

import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.domain.notice.dto.mapstruct.NoticeMapStruct;
import com.dawne.com2usbaseball.domain.notice.dto.request.NoticeAdminListRequest;
import com.dawne.com2usbaseball.domain.notice.dto.request.NoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeSource;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.notice.repository.AdminNoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminNoticeServiceImpl implements AdminNoticeService {

    private final AdminNoticeRepository adminNoticeRepository;
    private final NoticeMapStruct noticeMapStruct;

    @Override
    public List<NoticeResponse> getAdminNoticeList(NoticeAdminListRequest request) {
        List<NoticeEntity> notices;
        // 필터 조건이 있으면 동적 필터 쿼리 사용, 없으면 전체 조회
        if (request != null && (request.source() != null || request.isVisible() != null || request.isPinned() != null)) {
            notices = adminNoticeRepository.getAdminNoticeListFiltered(request.source(), request.isVisible(), request.isPinned());
        } else {
            notices = adminNoticeRepository.getAdminNoticeList();
        }
        return noticeMapStruct.toResponseList(notices);
    }

    @Override
    @Cacheable(value = "noticeDetail", key = "#noticeId + '_admin'")
    public NoticeResponse getAdminNoticeDetail(Long noticeId) {
        // Repository에서 null 시 BaseException 처리
        NoticeEntity notice = adminNoticeRepository.getAdminNoticeDetail(noticeId);
        return noticeMapStruct.toResponse(notice);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "notice", key = "'admin'"),
            @CacheEvict(value = "notice", key = "'public'")
    })
    public NoticeResponse createNotice(NoticeRequest request) {
        validateSourcePayload(request);

        NoticeEntity notice = noticeMapStruct.toEntity(request);
        if (notice.getContent() != null) {
            notice.setContent(sanitizeHtml(notice.getContent()));
        }

        if (!adminNoticeRepository.insertNotice(notice)) {
            throw new BaseException(NoticeMessages.NOTICE_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        NoticeEntity saved = adminNoticeRepository.findById(notice.getId())
                .orElseThrow(() -> new BaseException(NoticeMessages.NOTICE_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));

        return noticeMapStruct.toResponse(saved);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "notice", key = "'admin'"),
            @CacheEvict(value = "notice", key = "'public'"),
            @CacheEvict(value = "noticeDetail", key = "#noticeId + '_admin'"),
            @CacheEvict(value = "noticeDetail", key = "#noticeId + '_public'")
    })
    public NoticeResponse updateNotice(NoticeRequest request, Long noticeId) {
        validateSourcePayload(request);

        NoticeEntity notice = adminNoticeRepository.findById(noticeId)
                .orElseThrow(() -> new BaseException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        noticeMapStruct.updateEntity(request, notice);

        // 수정 시에도 새니타이징
        if (notice.getContent() != null) {
            notice.setContent(sanitizeHtml(notice.getContent()));
        }

        if (!adminNoticeRepository.updateNotice(notice)) {
            throw new BaseException(NoticeMessages.NOTICE_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return noticeMapStruct.toResponse(notice);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "notice", key = "'admin'"),
            @CacheEvict(value = "notice", key = "'public'"),
            @CacheEvict(value = "noticeDetail", key = "#noticeId + '_admin'"),
            @CacheEvict(value = "noticeDetail", key = "#noticeId + '_public'")
    })
    public void updateNoticeVisible(Long noticeId, Boolean isVisible) {
        // 존재 여부 먼저 확인
        adminNoticeRepository.findById(noticeId)
                .orElseThrow(() -> new BaseException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        if (!adminNoticeRepository.updateNoticeVisible(noticeId, isVisible)) {
            throw new BaseException(NoticeMessages.NOTICE_VISIBLE_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "notice", key = "'admin'"),
            @CacheEvict(value = "notice", key = "'public'"),
            @CacheEvict(value = "noticeDetail", key = "#noticeId + '_admin'"),
            @CacheEvict(value = "noticeDetail", key = "#noticeId + '_public'")
    })
    public void updateNoticePinned(Long noticeId, Boolean isPinned) {
        adminNoticeRepository.findById(noticeId)
                .orElseThrow(() -> new BaseException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        if (!adminNoticeRepository.updateNoticePinned(noticeId, isPinned)) {
            throw new BaseException(NoticeMessages.NOTICE_PINNED_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "notice", key = "'admin'"),
            @CacheEvict(value = "notice", key = "'public'"),
            @CacheEvict(value = "noticeDetail", key = "#noticeId + '_admin'"),
            @CacheEvict(value = "noticeDetail", key = "#noticeId + '_public'")
    })
    public void deleteNotice(Long noticeId) {
        adminNoticeRepository.findById(noticeId)
                .orElseThrow(() -> new BaseException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        if (!adminNoticeRepository.deleteNotice(noticeId)) {
            throw new BaseException(NoticeMessages.NOTICE_DELETED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 일괄 삭제 — 존재하는 id만 삭제, 존재하지 않는 id는 실패 목록으로 반환(전체 롤백 X)
    // 상세 캐시는 다건이라 개별 key evict 대신 noticeDetail 전체를 비운다(allEntries)
    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "notice", key = "'admin'"),
            @CacheEvict(value = "notice", key = "'public'"),
            @CacheEvict(value = "noticeDetail", allEntries = true)
    })
    public BulkOperationResponse bulkDeleteNotices(List<Long> ids) {
        List<Long> requestedIds = normalizeIds(ids);
        if (requestedIds.isEmpty()) {
            return BulkOperationResponse.empty();
        }

        List<Long> existingIds = adminNoticeRepository.selectExistingIds(requestedIds);
        List<Long> failedIds = requestedIds.stream().filter(id -> !existingIds.contains(id)).toList();

        if (!existingIds.isEmpty()) {
            adminNoticeRepository.deleteNoticesByIds(existingIds);
        }
        return BulkOperationResponse.of(existingIds, failedIds);
    }

    // 일괄 노출 여부 변경 — 위와 동일한 부분 실패 처리 방식
    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "notice", key = "'admin'"),
            @CacheEvict(value = "notice", key = "'public'"),
            @CacheEvict(value = "noticeDetail", allEntries = true)
    })
    public BulkOperationResponse bulkUpdateNoticesVisible(List<Long> ids, Boolean isVisible) {
        List<Long> requestedIds = normalizeIds(ids);
        if (requestedIds.isEmpty()) {
            return BulkOperationResponse.empty();
        }

        List<Long> existingIds = adminNoticeRepository.selectExistingIds(requestedIds);
        List<Long> failedIds = requestedIds.stream().filter(id -> !existingIds.contains(id)).toList();

        if (!existingIds.isEmpty()) {
            adminNoticeRepository.updateNoticesVisibleByIds(existingIds, isVisible);
        }
        return BulkOperationResponse.of(existingIds, failedIds);
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return ids.stream().filter(java.util.Objects::nonNull).distinct().toList();
    }

    // DB CHECK 제약 미러링
    private void validateSourcePayload(NoticeRequest request) {
        if (request.source() == null) {
            throw new BaseException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
        }

        if (request.source() == NoticeSource.INTERNAL) {
            if (request.content() == null || request.content().isBlank()) {
                throw new BaseException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
            if (request.externalUrl() != null && !request.externalUrl().isBlank()) {
                throw new BaseException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
        }

        if (request.source() == NoticeSource.EXTERNAL) {
            if (request.externalUrl() == null || request.externalUrl().isBlank()) {
                throw new BaseException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
            if (request.content() != null && !request.content().isBlank()) {
                throw new BaseException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
        }
    }

    // 새니타이징 메서드
    private String sanitizeHtml(String html) {
        if (html == null) return null;
        return Jsoup.clean(html, Safelist.relaxed());
    }
}
