package com.dawne.com2usbaseball.domain.notice.service;

import com.dawne.com2usbaseball.domain.notice.dto.mapstruct.NoticeMapStruct;
import com.dawne.com2usbaseball.domain.notice.dto.request.NoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeSource;
import com.dawne.com2usbaseball.domain.notice.exception.NoticeException;
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
    @Cacheable(value = "notice", key = "'admin'")
    public List<NoticeResponse> getAdminNoticeList() {
        List<NoticeEntity> notices = adminNoticeRepository.getAdminNoticeList();
        return noticeMapStruct.toResponseList(notices);
    }

    @Override
    @Cacheable(value = "noticeDetail", key = "#noticeId + '_admin'")
    public NoticeResponse getAdminNoticeDetail(Long noticeId) {
        // Repository에서 null 시 NoticeException 처리
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
            throw new NoticeException(NoticeMessages.NOTICE_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        NoticeEntity saved = adminNoticeRepository.findById(notice.getId())
                .orElseThrow(() -> new NoticeException(NoticeMessages.NOTICE_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));

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
                .orElseThrow(() -> new NoticeException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        noticeMapStruct.updateEntity(request, notice);

        // 수정 시에도 새니타이징
        if (notice.getContent() != null) {
            notice.setContent(sanitizeHtml(notice.getContent()));
        }

        if (!adminNoticeRepository.updateNotice(notice)) {
            throw new NoticeException(NoticeMessages.NOTICE_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
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
                .orElseThrow(() -> new NoticeException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        if (!adminNoticeRepository.updateNoticeVisible(noticeId, isVisible)) {
            throw new NoticeException(NoticeMessages.NOTICE_VISIBLE_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
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
                .orElseThrow(() -> new NoticeException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        if (!adminNoticeRepository.updateNoticePinned(noticeId, isPinned)) {
            throw new NoticeException(NoticeMessages.NOTICE_PINNED_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
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
                .orElseThrow(() -> new NoticeException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));

        if (!adminNoticeRepository.deleteNotice(noticeId)) {
            throw new NoticeException(NoticeMessages.NOTICE_DELETED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DB CHECK 제약 미러링
    private void validateSourcePayload(NoticeRequest request) {
        if (request.source() == null) {
            throw new NoticeException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
        }

        if (request.source() == NoticeSource.INTERNAL) {
            if (request.content() == null || request.content().isBlank()) {
                throw new NoticeException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
            if (request.externalUrl() != null && !request.externalUrl().isBlank()) {
                throw new NoticeException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
        }

        if (request.source() == NoticeSource.EXTERNAL) {
            if (request.externalUrl() == null || request.externalUrl().isBlank()) {
                throw new NoticeException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
            if (request.content() != null && !request.content().isBlank()) {
                throw new NoticeException(NoticeMessages.NOTICE_INVALID_SOURCE_PAYLOAD, HttpStatus.BAD_REQUEST);
            }
        }
    }

    // 새니타이징 메서드
    private String sanitizeHtml(String html) {
        if (html == null) return null;
        return Jsoup.clean(html, Safelist.relaxed());
    }
}
