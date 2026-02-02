package com.dawne.com2usbaseball.domain.community.dto.response;


import java.util.List;

public record BoardListResponse(
        List<BoardResponse> boards
) {
    public static BoardListResponse of(List<BoardResponse> boards) {
        return new BoardListResponse(
                boards == null ? List.of() : boards
        );
    }
}
