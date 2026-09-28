package com.dawne.com2usbaseball.common.util;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

// 어드민이 보내는 기간/만료 문자열을 초 단위 LocalDateTime 으로 통일한다.
// events(startAt/expireAt) 와 coupons(expireAt) 가 같은 규칙을 쓰도록 한 곳에 모았다.
public final class DateTimeUtils {

    // 날짜만 온 값에 채우는 기본 시각 — 시작은 정오, 종료·만료는 그날 끝
    public static final LocalTime DEFAULT_START_TIME = LocalTime.of(12, 0, 0);
    public static final LocalTime DEFAULT_EXPIRE_TIME = LocalTime.of(23, 59, 59);

    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    // 초는 있어도 없어도 되게 optional 처리("[:ss]") — 없으면 0초로 채워진다.
    // "yyyy-MM-dd'T'HH:mm" 형태는 T를 공백으로 치환해 흡수한다
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm[:ss]");

    private DateTimeUtils() {
        throw new UnsupportedOperationException();
    }

    /**
     * "yyyy-MM-dd" / "yyyy-MM-dd HH:mm" / "yyyy-MM-dd HH:mm:ss" 를 모두 흡수해 초 단위로 정규화한다.
     * 날짜만 오면 defaultTime, 분까지만 오면 0초를 채운다.
     * null/빈 문자열은 "값 없음"으로 보고 null 을 그대로 돌려준다 — 필수 체크와 부분수정 판단은 호출부 책임.
     */
    public static LocalDateTime normalize(String raw, LocalTime defaultTime, Enum<?> invalidFormatCode) {
        if (raw == null || raw.isBlank()) {
            return null;
        }

        String trimmed = raw.trim();
        try {
            if (trimmed.length() == 10) {
                return LocalDate.parse(trimmed, DATE_ONLY_FORMATTER).atTime(defaultTime);
            }
            return LocalDateTime.parse(trimmed.replace('T', ' '), DATE_TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new BaseException(invalidFormatCode, HttpStatus.BAD_REQUEST);
        }
    }
}
