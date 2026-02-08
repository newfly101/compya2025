package com.dawne.com2usbaseball.domain.community.service.board;

import com.dawne.com2usbaseball.common.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.board.BoardListResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;

public interface BoardService {

    BoardListResponse selectBoardList();
    OperationResponse<CommunityMessages> createNewBoardItem(BoardsEntity boards);
    OperationResponse<CommunityMessages> updateBoardItem(BoardsEntity boards);

    BoardListResponse selectUserBoardList();
}
