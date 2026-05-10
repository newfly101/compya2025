package com.dawne.com2usbaseball.common.support;

import java.util.List;
import java.util.function.Function;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;

public class ListAssembler {

    public static <E, R> ListResponse<R> assemble(
            List<E> entities,
            Function<E, R> mapper
    ) {
        return ListResponse.of(
                entities.stream()
                        .map(mapper)
                        .toList()
        );
    }
}
