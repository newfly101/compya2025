package com.dawne.com2usbaseball.common.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.List;

public final class JsonUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private JsonUtils() {
        throw new UnsupportedOperationException();
    }

    /** JSON 배열 → List<String> */
    public static List<String> toList(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("JSON List 파싱 실패: " + json, e);
        }
    }

    /** 객체 → JSON 문자열 */
    public static String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("JSON 직렬화 실패: " + value.getClass().getSimpleName(), e);
        }
    }

    /** JSON 객체 → 지정한 타입 */
    public static <T> T toObject(String json, Class<T> clazz) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "JSON Object 파싱 실패: " + json + " → " + clazz.getSimpleName(),
                    e
            );
        }
    }
}
