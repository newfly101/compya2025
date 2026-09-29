package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.entity.EventEntity;

/** 카페 수집 결과를 DB 에 반영한다 — 트랜잭션·캐시 무효화 단위 (네트워크 호출과 분리) */
public interface EventCollectService {

    /** 수집 초안 저장 (비공개). 저장된 id 를 돌려준다. */
    Long saveDraft(EventEntity draft);

    /** 본문·해시(·배너) 반영 — "본문 갱신" */
    void applyContent(Long id, String contentHtml, String contentHash, String imageUrl);

    /** 원문이 바뀐 것을 표시 — 본문은 그대로 두고 마지막으로 본 해시만 바꾼다 */
    void markSourceChanged(Long id, String newSourceHash);
}
