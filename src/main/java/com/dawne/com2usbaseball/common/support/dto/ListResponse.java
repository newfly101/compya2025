package com.dawne.com2usbaseball.common.support.dto;
import java.util.List;

public record ListResponse<T>(
        List<T> items
) {
    public static <T> ListResponse<T> of(List<T> items) {
        return new ListResponse<>(
                items == null ? List.of() : items);
    }
}
