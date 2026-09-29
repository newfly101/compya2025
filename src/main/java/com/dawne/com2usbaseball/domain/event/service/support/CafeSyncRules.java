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

    private static final java.util.regex.Pattern LINK_TAIL_RE = java.util.regex.Pattern.compile("(\\d+)(?:[?#].*)?/?$");

    /** 주소 끝 숫자가 글번호인가 — cafe.naver.com/{카페}/{id} · f-e/.../articles/{id}?query 형식 모두 */
    public static boolean linkEndsWithArticleId(String link, long articleId) {
        if (link == null) return false;
        java.util.regex.Matcher m = LINK_TAIL_RE.matcher(link.trim());
        return m.find() && m.group(1).equals(Long.toString(articleId));
    }

    /**
     * 이벤트 이름 비교용 정규화 — [이벤트] 머리말·공백·기호·이모지를 지우고 한글·영문·숫자만 남긴 뒤 끝의 "이벤트" 를 뺀다.
     * 결과가 비면 빈 문자열(짝 판정에 쓰지 않는다).
     */
    public static String normalizeEventName(String name) {
        if (name == null) return "";
        String s = name.replace("[이벤트]", "").replaceAll("[^가-힣a-zA-Z0-9]", "");
        return s.endsWith("이벤트") ? s.substring(0, s.length() - "이벤트".length()) : s;
    }
}
