package com.dawne.com2usbaseball.domain.oauth.service.support;

/** 닉네임 규칙의 단일 출처 — 미설정 판단 · 형식. 가입 시 네이버 기본값은 "***" 로 끝난다. */
public final class NicknamePolicy {

    public static final int MAX_LENGTH = 20;
    private static final String UNSET_SUFFIX = "***";

    private NicknamePolicy() {}

    public static boolean isSet(String nickname) {
        return nickname != null && !nickname.isBlank() && !nickname.endsWith(UNSET_SUFFIX);
    }

    /** trim 된 값 기준 — 빈 값 · 20자 초과 · "***" 로 끝남이면 false */
    public static boolean isValid(String trimmed) {
        return trimmed != null && !trimmed.isEmpty() && trimmed.length() <= MAX_LENGTH && isSet(trimmed);
    }
}
