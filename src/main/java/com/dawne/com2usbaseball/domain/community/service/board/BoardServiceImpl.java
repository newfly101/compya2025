package com.dawne.com2usbaseball.domain.community.service.board;

import com.dawne.com2usbaseball.domain.community.dto.response.BoardListResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;
import com.dawne.com2usbaseball.domain.community.repository.BoardRepository;
import com.dawne.com2usbaseball.domain.community.service.board.support.ListMaker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService{

    private final BoardRepository repository;
    private final ListMaker listMaker;

    @Override
    public BoardListResponse selectBoardList() {
        List<BoardsEntity> boards = repository.selectBoardItems();

        return listMaker.makeBoardListMaker(boards);
    }

    @Override
    public void selectPostList(String boardCode) {

    }
}
