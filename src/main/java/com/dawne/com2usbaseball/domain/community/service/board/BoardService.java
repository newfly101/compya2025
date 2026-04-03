package com.dawne.com2usbaseball.domain.community.service.board;

import com.dawne.com2usbaseball.domain.community.entity.BoardEntity;

import java.util.List;

public interface BoardService {

    List<BoardEntity> getBoardList();

    List<BoardEntity> getVisibleBoardList();

    BoardEntity getBoardDetail(Long id);

    BoardEntity getBoardDetailByCode(String code);

    Long createBoard(BoardEntity entity);

    void updateBoard(Long id, BoardEntity entity);

    void updateBoardVisible(Long id, Boolean isVisible);

    void deleteBoard(Long id);
}
