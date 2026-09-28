package com.dawne.com2usbaseball.domain.analytics.service.support;

import com.dawne.com2usbaseball.domain.analytics.dto.request.AnalyticsEventItemRequest;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsEventType;

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
    public static final int NAV_TYPE_MAX_LENGTH = 16;

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

    /** UA 문자열에서 OS 만 뽑는다. 버전은 저장하지 않는다(요청사항). */
    public static String detectOs(String userAgent) {
        if (userAgent == null) {
            return "Other";
        }
        String lower = userAgent.toLowerCase();
        if (lower.contains("android")) {
            return "Android";
        }
        if (lower.contains("iphone") || lower.contains("ipad")) {
            return "iOS";
        }
        if (lower.contains("windows")) {
            return "Windows";
        }
        if (lower.contains("mac os") || lower.contains("macintosh")) {
            return "Mac";
        }
        return "Other";
    }

    /**
     * UA 로 기기 종류를 가늠하되, 뷰포트 폭이 480px 이하면 무조건 mobile 로 덮어쓴다
     * — 모바일 브라우저가 데스크탑 UA 를 흉내내는 경우가 있어 화면 폭이 더 믿을 만하다.
     */
    public static String detectDeviceType(String userAgent, Integer screenW) {
        if (screenW != null && screenW <= 480) {
            return "mobile";
        }
        if (userAgent == null) {
            return "pc";
        }
        String lower = userAgent.toLowerCase();
        if (lower.contains("ipad")) {
            return "tablet";
        }
        if (lower.contains("iphone") || (lower.contains("android") && lower.contains("mobile"))) {
            return "mobile";
        }
        return "pc";
    }

    /** 순서가 중요하다 — Edge/Chrome 의 UA 에도 "Safari" 문자열이 섞여 있다. */
    public static String detectBrowser(String userAgent) {
        if (userAgent == null) {
            return "Other";
        }
        String lower = userAgent.toLowerCase();
        if (lower.contains("edg/")) {
            return "Edge";
        }
        if (lower.contains("chrome/")) {
            return "Chrome";
        }
        if (lower.contains("samsungbrowser")) {
            return "Samsung";
        }
        if (lower.contains("firefox/")) {
            return "Firefox";
        }
        if (lower.contains("safari/")) {
            return "Safari";
        }
        return "Other";
    }

    /**
     * 이벤트 종류별 필수 필드가 다 채워졌는지 본다. 공통(anonId/sessionId/pagePath) +
     * PAGE_VIEW 는 navType, OUTBOUND_CLICK 은 targetUrl. item_id 는 이번 라운드
     * 실제로 채우는 FE 호출부가 없어 필수에서 제외한다(draft 표 수정, decisions.log).
     */
    public static boolean hasRequiredFields(AnalyticsEventItemRequest item, AnalyticsEventType eventType) {
        if (isBlank(item.anonId()) || isBlank(item.sessionId()) || isBlank(item.pagePath())) {
            return false;
        }
        if (eventType == AnalyticsEventType.PAGE_VIEW && isBlank(item.navType())) {
            return false;
        }
        if (eventType == AnalyticsEventType.OUTBOUND_CLICK && isBlank(item.targetUrl())) {
            return false;
        }
        return true;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
