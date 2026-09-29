package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.common.support.cache.CacheEvictAfterCommit;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EventCollectServiceImpl implements EventCollectService {

    private final EventRepository repository;

    @Override
    @CacheEvictAfterCommit(cacheName = "events", keys = {"external::admin", "external::public"})
    public Long saveDraft(EventEntity draft) {
        if (!repository.saveEvent(draft)) {
            throw new BaseException(EventMessages.EVENT_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return draft.getId();
    }

    @Override
    @CacheEvictAfterCommit(cacheName = "events", keys = {"external::admin", "external::public"})
    public void applyContent(Long id, String contentHtml, String contentHash, String imageUrl) {
        repository.updateCollectedContent(id, contentHtml, contentHash, imageUrl);
    }

    @Override
    @CacheEvictAfterCommit(cacheName = "events", keys = {"external::admin", "external::public"})
    public void markSourceChanged(Long id, String newSourceHash) {
        repository.updateCollectedHash(id, newSourceHash);
    }
}
