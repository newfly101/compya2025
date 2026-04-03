package com.dawne.com2usbaseball.common.support.dto;

import com.dawne.com2usbaseball.common.enums.CommonMessages;

public record GlobalResponse<T>(
        boolean success,
        Enum<?> code,
        T data
) {
    public static <T> GlobalResponse<T> success(T data) {
        return new GlobalResponse<>(true, CommonMessages.SUCCESS, data);
    }

    public static <T> GlobalResponse<T> success(Enum<?> code, T data) {
        return new GlobalResponse<>(true, code, data);
    }

    public static <T> GlobalResponse<T> fail(Enum<?> code) {
        return new GlobalResponse<>(false, code, null);
    }
}
