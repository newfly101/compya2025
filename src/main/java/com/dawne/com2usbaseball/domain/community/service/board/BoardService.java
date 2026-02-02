package com.dawne.com2usbaseball.domain.community.service.board;

import com.dawne.com2usbaseball.domain.community.dto.response.BoardListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.InsertBoardResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.UpdateBoardResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;

public interface BoardService {

    BoardListResponse selectBoardList();
    InsertBoardResponse createNewBoardItem(BoardsEntity boards);
    UpdateBoardResponse updateBoardItem(BoardsEntity boards);
}
