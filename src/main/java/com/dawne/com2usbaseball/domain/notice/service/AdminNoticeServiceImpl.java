package com.dawne.com2usbaseball.domain.notice.service;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.notice.dto.mapstruct.NoticeMapStruct;
import com.dawne.com2usbaseball.domain.notice.dto.request.ChangeNoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;
import com.dawne.com2usbaseball.domain.notice.repository.AdminNoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminNoticeServiceImpl implements AdminNoticeService {

    private final AdminNoticeRepository adminNoticeRepository;
    private final NoticeMapStruct noticeMapStruct;

    @Override
    public ListResponse<NoticeResponse> getAdminNoticeList() {
        List<NoticeEntity> notices = adminNoticeRepository.getAdminNoticeList();
        return ListAssembler.assemble(notices, noticeMapStruct::toResponse);
    }

    @Override
    public NoticeResponse getAdminNoticeDetail(Long noticeId) {
        NoticeEntity notice = adminNoticeRepository.getAdminNoticeDetail(noticeId);
        return noticeMapStruct.toResponse(notice);
    }

    @Override
    @Transactional
    public OperationResponse<NoticeMessages> createNotice(ChangeNoticeRequest request) {
        NoticeEntity notice = noticeMapStruct.toEntity(request);
        return adminNoticeRepository.insertNotice(notice)
                ? OperationResponse.success(NoticeMessages.NOTICE_CREATED, notice.getId())
                : OperationResponse.fail(NoticeMessages.NOTICE_FAILED);
    }

    @Override
    @Transactional
    public OperationResponse<NoticeMessages> updateNotice(ChangeNoticeRequest request,Long noticeId) {
        NoticeEntity notice = noticeMapStruct.toEntity(request, noticeId);
        return adminNoticeRepository.updateNotice(notice)
                ? OperationResponse.success(NoticeMessages.NOTICE_UPDATED, noticeId)
                : OperationResponse.fail(NoticeMessages.NOTICE_FAILED);
    }

    @Override
    @Transactional
    public OperationResponse<NoticeMessages> updateNoticeVisible(Long noticeId, Boolean isVisible) {
        return adminNoticeRepository.updateNoticeVisible(noticeId, isVisible)
                ? OperationResponse.success(NoticeMessages.NOTICE_VISIBLE_UPDATED, noticeId)
                : OperationResponse.fail(NoticeMessages.NOTICE_FAILED);
    }

    @Override
    @Transactional
    public OperationResponse<NoticeMessages> updateNoticePinned(Long noticeId, Boolean isPinned) {
        return adminNoticeRepository.updateNoticePinned(noticeId, isPinned)
                ? OperationResponse.success(NoticeMessages.NOTICE_PINNED_UPDATED, noticeId)
                : OperationResponse.fail(NoticeMessages.NOTICE_FAILED);
    }

    @Override
    @Transactional
    public OperationResponse<NoticeMessages> deleteNotice(Long noticeId) {
        return adminNoticeRepository.deleteNotice(noticeId)
                ? OperationResponse.success(NoticeMessages.NOTICE_DELETED, noticeId)
                : OperationResponse.fail(NoticeMessages.NOTICE_FAILED);
    }
}
