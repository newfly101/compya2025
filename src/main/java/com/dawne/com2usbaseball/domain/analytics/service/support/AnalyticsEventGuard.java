package com.dawne.com2usbaseball.domain.analytics.service.support;

import java.util.List;
import java.util.regex.Pattern;

/**
 * 수집 이벤트를 저장하기 "전에" 걸러내고 다듬는 순수 로직만 모아둔다.
 * DB/HTTP 에 의존하지 않아 단위 테스트로 검증하기 쉽다.
 */
public final class AnalyticsEventGuard {

    private AnalyticsEventGuard() {
        throw new UnsupportedOperationException();
    }

    /** 한 요청에서 처리할 최대 이벤트 수. 넘으면 앞에서부터 이만큼만 쓴다. */
    public static final int MAX_EVENTS_PER_REQUEST = 20;

    public static final int TARGET_URL_MAX_LENGTH = 500;
    public static final int SEARCH_KEYWORD_MAX_LENGTH = 100;
    public static final int USER_AGENT_MAX_LENGTH = 255;
    public static final int REFERRER_MAX_LENGTH = 500;
    public static final int PAGE_PATH_MAX_LENGTH = 255;
    public static final int CONTENT_TYPE_MAX_LENGTH = 20;
    public static final int CONTENT_ID_MAX_LENGTH = 50;
    public static final int COUNTRY_MAX_LENGTH = 10;

    private static final Pattern UUID_PATTERN = Pattern.compile(
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    );

    /**
     * 명백한 크롤러/봇 User-Agent 목록. 100% 걸러지진 않는다(휴리스틱 한계) —
     * 이 API 는 JS 가 fetch/XHR 로 직접 호출해야만 찍히므로, HTML 만 긁는 단순
     * 크롤러는 애초에 이벤트를 안 쏜다. 여기 목록은 "이벤트를 굳이 보내는" 형태의
     * 봇(헤드리스 브라우저 크롤러, SEO 진단봇 등)을 추가로 거르기 위함이다.
     */
    private static final List<String> BOT_UA_PATTERNS = List.of(
            "googlebot", "bingbot", "yandexbot", "baiduspider", "duckduckbot",
            "ahrefsbot", "semrushbot", "mj12bot", "dotbot", "petalbot",
            "curl", "python-requests", "python-urllib", "wget", "scrapy",
            "headlesschrome", "phantomjs", "bot", "spider", "crawler"
    );

    public static boolean isValidUuid(String anonId) {
        return anonId != null && UUID_PATTERN.matcher(anonId).matches();
    }

    public static boolean isBot(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            // UA 가 아예 없는 요청도 정상 브라우저는 아니므로 봇으로 취급한다.
            return true;
        }
        String lower = userAgent.toLowerCase();
        for (String pattern : BOT_UA_PATTERNS) {
            if (lower.contains(pattern)) {
                return true;
            }
        }
        return false;
    }

    /** null 은 null 그대로 둔다 — 컬럼이 nullable 이라 빈 문자열로 바꿀 필요 없음. */
    public static String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }
}
