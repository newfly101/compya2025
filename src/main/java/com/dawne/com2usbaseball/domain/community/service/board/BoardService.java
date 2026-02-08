package com.dawne.com2usbaseball.domain.community.service.board;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;

public interface BoardService {

    ListResponse<BoardResponse> selectBoardList();
    OperationResponse<CommunityMessages> createNewBoardItem(BoardsEntity boards);
    OperationResponse<CommunityMessages> updateBoardItem(BoardsEntity boards);

    ListResponse<BoardResponse> selectUserBoardList();
}
