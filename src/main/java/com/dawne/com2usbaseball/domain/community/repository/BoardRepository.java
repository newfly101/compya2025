package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;
import com.dawne.com2usbaseball.domain.community.repository.mapper.BoardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@RequiredArgsConstructor
@Repository
public class BoardRepository {

    private final BoardMapper mapper;

    public List<BoardsEntity> selectBoardItems() {
        return mapper.selectBoards();
    }

    public boolean insertNewBoard(BoardsEntity boards) {
        return mapper.insertBoard(boards) > 0;
    }

    public boolean updateBoard(BoardsEntity boards) {
        return mapper.updateBoard(boards) > 0;
    }

    public List<BoardsEntity> selectUserBoardItems() {
        return mapper.selectBoardsWithUser();
    }
}
