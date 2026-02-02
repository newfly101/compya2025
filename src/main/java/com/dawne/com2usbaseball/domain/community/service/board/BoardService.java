package com.dawne.com2usbaseball.domain.community.service.board;

import com.dawne.com2usbaseball.domain.community.dto.response.BoardListResponse;

public interface BoardService {

    BoardListResponse selectBoardList();
    void selectPostList(String boardCode);
}
