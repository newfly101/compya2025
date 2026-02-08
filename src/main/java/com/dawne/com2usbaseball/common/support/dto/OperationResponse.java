package com.dawne.com2usbaseball.common.support.dto;

public record OperationResponse <M>(
        boolean success,
        M message,
        Long id
) {
    public static <M> OperationResponse<M> success(M message, Long id) {
        return new OperationResponse<>(true, message, id);
    }

    public static <M> OperationResponse<M> fail(M message) {
        return new OperationResponse<>(false, message, null);
    }
}
