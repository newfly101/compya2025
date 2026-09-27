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
import com.dawne.com2usbaseball.common.support.cache.CacheEvictAfterCommit;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

import java.time.LocalDateTime;
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

    // 운영자가 DB 에 직접 반영한 변경사항을 즉시 앱에 반영하기 위해 공지 관련 캐시를 비우고 최신 목록을 다시 조회
    // notice 캐시는 'public' 키 하나만 실제로 쓰인다(어드민 목록 getAdminNoticeList 는 캐시 없이 항상 DB 직접 조회) —
    // allEntries 대신 그 키만 명시로 비워 범위를 넓히지 않는다
    // noticeDetail 은 공지 id 별로 키가 갈려(#noticeId + '_admin'/'_public') 전체를 알 수 없으므로 allEntries 유지 —
    // 하나라도 빠지면 상세는 여전히 옛 값이 보인다
    // 자기호출(getAdminNoticeList) 시 AOP 프록시를 우회해 캐시가 안 타므로 repository 를 직접 호출한다
    @Override
    @Transactional(readOnly = true)
    @Caching(evict = {
            @CacheEvict(value = "notice", key = "'public'"),
            @CacheEvict(value = "noticeDetail", allEntries = true)
    })
    public List<NoticeResponse> refreshNotices() {
        List<NoticeEntity> notices = adminNoticeRepository.getAdminNoticeList();
        return noticeMapStruct.toResponseList(notices);
    }

    @Override
    @Cacheable(value = "noticeDetail", key = "#noticeId + '_admin'")
    public NoticeResponse getAdminNoticeDetail(Long noticeId) {
        NoticeEntity notice = adminNoticeRepository.getAdminNoticeDetail(noticeId)
                .orElseThrow(() -> new BaseException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));
        return noticeMapStruct.toResponse(notice);
    }

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "notice", keys = {"admin", "public"})
    public NoticeResponse createNotice(NoticeRequest request) {
        // 살균을 먼저 하고 그 결과를 검증한다 — 허용 태그가 하나도 없는 본문은 살균 후 빈 문자열이
        // 되는데, 빈 문자열은 DB CHECK(content IS NOT NULL)를 통과해 본문 없는 공지로 저장된다.
        String content = sanitizeHtml(request.content());
        validateSourcePayload(request.source(), content, request.externalUrl());

        NoticeEntity notice = noticeMapStruct.toEntity(request);
        notice.setContent(content);

        // 어드민 글쓰기 화면에 발행일 입력이 없어 null 로 들어오면 등록 시각으로 채운다
        if (notice.getPublishedAt() == null) {
            notice.setPublishedAt(LocalDateTime.now());
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
    @CacheEvictAfterCommit(cacheName = "notice", keys = {"admin", "public"})
    @CacheEvictAfterCommit(cacheName = "noticeDetail", keyExpressions = {"#noticeId + '_admin'", "#noticeId + '_public'"})
    public NoticeResponse updateNotice(NoticeRequest request, Long noticeId) {
        // 생성과 동일하게 살균 → 검증 순서(살균 후 빈 본문을 걸러낸다)
        String content = sanitizeHtml(request.content());
        validateSourcePayload(request.source(), content, request.externalUrl());

        NoticeEntity notice = adminNoticeRepository.findById(noticeId)
                .orElseThrow(() -> new BaseException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        noticeMapStruct.updateEntity(request, notice);
        notice.setContent(content);

        if (!adminNoticeRepository.updateNotice(notice)) {
            throw new BaseException(NoticeMessages.NOTICE_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return noticeMapStruct.toResponse(notice);
    }

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "notice", keys = {"admin", "public"})
    @CacheEvictAfterCommit(cacheName = "noticeDetail", keyExpressions = {"#noticeId + '_admin'", "#noticeId + '_public'"})
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
    @CacheEvictAfterCommit(cacheName = "notice", keys = {"admin", "public"})
    @CacheEvictAfterCommit(cacheName = "noticeDetail", keyExpressions = {"#noticeId + '_admin'", "#noticeId + '_public'"})
    public void updateNoticePinned(Long noticeId, Boolean isPinned) {
        adminNoticeRepository.findById(noticeId)
                .orElseThrow(() -> new BaseException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        if (!adminNoticeRepository.updateNoticePinned(noticeId, isPinned)) {
            throw new BaseException(NoticeMessages.NOTICE_PINNED_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "notice", keys = {"admin", "public"})
    @CacheEvictAfterCommit(cacheName = "noticeDetail", keyExpressions = {"#noticeId + '_admin'", "#noticeId + '_public'"})
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
    @CacheEvictAfterCommit(cacheName = "notice", keys = {"admin", "public"})
    @CacheEvictAfterCommit(cacheName = "noticeDetail", allEntries = true)
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
    @CacheEvictAfterCommit(cacheName = "notice", keys = {"admin", "public"})
    @CacheEvictAfterCommit(cacheName = "noticeDetail", allEntries = true)
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

    // DB CHECK 제약 미러링 — content 는 살균을 거친 값을 넘긴다(호출부 참고)
    private void validateSourcePayload(NoticeSource source, String content, String externalUrl) {
        if (source == null) {
            throw new BaseException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
        }

        if (source == NoticeSource.INTERNAL) {
            if (content == null || content.isBlank()) {
                throw new BaseException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
            if (externalUrl != null && !externalUrl.isBlank()) {
                throw new BaseException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
        }

        if (source == NoticeSource.EXTERNAL) {
            if (externalUrl == null || externalUrl.isBlank()) {
                throw new BaseException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
            if (content != null && !content.isBlank()) {
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
