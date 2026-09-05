package com.dawne.com2usbaseball.common.support;

import java.util.regex.Pattern;

/**
 * 제목 → URL 슬러그 변환 유틸.
 * 한글 슬러그를 그대로 허용한다 (로마자 변환 X).
 *
 * 규칙
 * 1) 앞뒤 공백 제거 → 소문자화 (영문만 해당)
 * 2) 한글·영문·숫자는 그대로, 공백/기호는 '-' 하나로 치환
 * 3) 연속된 '-' 는 하나로 접고, 앞뒤 '-' 는 제거
 * 4) 최대 180자로 자름 (컬럼 200자 여유)
 * 5) 결과가 비면(제목이 기호뿐인 경우) 호출부에서 "notice-{id}" 로 대체한다
 *    (이 클래스는 id 를 모르므로 빈 문자열을 그대로 반환한다)
 * 6) 중복 처리는 DB 조회가 필요하므로 호출부(Service)에서 처리한다
 */
public class SlugUtils {

    private static final int MAX_LENGTH = 180;

    // 소문자 영문 / 숫자 / 한글(완성형 + 자모)이 아닌 모든 문자를 치환 대상으로 본다
    private static final Pattern INVALID_CHARS = Pattern.compile("[^a-z0-9\\p{IsHangul}]+");
    private static final Pattern MULTI_DASH = Pattern.compile("-{2,}");

    private SlugUtils() {
    }

    public static String slugify(String title) {
        if (title == null) {
            return "";
        }

        String normalized = title.trim().toLowerCase();
        normalized = INVALID_CHARS.matcher(normalized).replaceAll("-");
        normalized = MULTI_DASH.matcher(normalized).replaceAll("-");
        normalized = stripDashes(normalized);

        if (normalized.length() > MAX_LENGTH) {
            normalized = stripDashes(normalized.substring(0, MAX_LENGTH));
        }

        return normalized;
    }

    private static String stripDashes(String value) {
        int start = 0;
        int end = value.length();
        while (start < end && value.charAt(start) == '-') {
            start++;
        }
        while (end > start && value.charAt(end - 1) == '-') {
            end--;
        }
        return value.substring(start, end);
    }
}
