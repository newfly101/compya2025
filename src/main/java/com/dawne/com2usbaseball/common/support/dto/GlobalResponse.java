package com.dawne.com2usbaseball.common.support.dto;

public record GlobalResponse<T>(
        boolean success,
        String code,
        T data
) {
    public static <T> GlobalResponse<T> success(String code, T data) {
        return new GlobalResponse<>(true, code, data);
    }

    public static <T> GlobalResponse<T> fail(String code) {
        return new GlobalResponse<>(false, code, null);
    }
}
