package com.dawne.com2usbaseball.common.dto;

public record OperationResponse <M, T>(
        boolean success,
        M message,
        T id
) {
    public static <M,T> OperationResponse<M,T> success(M message, T id) {
        return new OperationResponse<>(true, message, id);
    }

    public static <M,T> OperationResponse<M,T> fail(M message) {
        return new OperationResponse<>(false, message, null);
    }
}
