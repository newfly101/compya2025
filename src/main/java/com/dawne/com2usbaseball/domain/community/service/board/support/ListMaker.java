package com.dawne.com2usbaseball.domain.community.service.board.support;

import com.dawne.com2usbaseball.domain.community.dto.response.BoardListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ListMaker {

    public BoardListResponse makeBoardListMaker(List<BoardsEntity> boardLists) {
        List<BoardResponse> boards = boardLists.stream()
                .map(BoardResponse::from)
                .toList();

        return BoardListResponse.of(boards);
    }
}
