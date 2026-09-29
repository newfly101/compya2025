package com.dawne.com2usbaseball.domain.event.service.support;

import com.dawne.com2usbaseball.domain.event.entity.EventEntity;

import java.time.LocalDateTime;

/** 수집 이벤트의 파생 상태 규칙 — 별도 컬럼 없이 기존 컬럼에서 계산한다 (ADR 0009). */
public final class CafeSyncRules {

    private CafeSyncRules() { }

    /** 마감을 알 수 없는 수집 이벤트의 자리표시 마감 — 관리자가 실제 값을 채우면 사라진다. */
    public static final LocalDateTime UNCONFIRMED_EXPIRE = LocalDateTime.of(2099, 12, 31, 23, 59, 59);

    /**
     * 원문 변경 = 마지막으로 본 원문 해시(content_hash)가 저장된 본문의 해시와 다르다.
     * 배치가 변경을 감지하면 본문은 그대로 두고 content_hash 만 새 값으로 바꾼다. "본문 갱신"이 둘을 다시 맞춘다.
     */
    public static boolean isSourceChanged(EventEntity e) {
        if (e == null || e.getSourceArticleId() == null || e.getContentHtml() == null || e.getContentHash() == null) {
            return false;
        }
        return !e.getContentHash().equals(CafeArticleParser.contentHash(e.getContentHtml()));
    }

    public static boolean isDeadlineUnconfirmed(EventEntity e) {
        return e != null && e.getSourceArticleId() != null && UNCONFIRMED_EXPIRE.equals(e.getExpireAt());
    }
}
