package com.dawne.com2usbaseball.domain.community.service.board;

import com.dawne.com2usbaseball.domain.community.dto.response.board.BoardListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.board.InsertBoardResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.board.UpdateBoardResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;
import com.dawne.com2usbaseball.domain.community.repository.BoardRepository;
import com.dawne.com2usbaseball.domain.community.service.board.support.ListMaker;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardRepository repository;
    @Resource(name = "boardListMaker")
    private final ListMaker listMaker;

    @Override
    @Transactional(readOnly = true)
//    @Cacheable(value="adminBoards")
    public BoardListResponse selectBoardList() {
        List<BoardsEntity> boards = repository.selectBoardItems();

        return listMaker.makeBoardListMaker(boards);
    }

    @Override
    @CacheEvict(value="adminBoards", allEntries = true)
    public InsertBoardResponse createNewBoardItem(BoardsEntity boards) {
        boolean success = repository.insertNewBoard(boards);

        if (!success) {
            return InsertBoardResponse.fail();
        }

        return InsertBoardResponse.success(boards.getId());
    }

    @Override
    @CacheEvict(value="adminBoards", allEntries = true)
    public UpdateBoardResponse updateBoardItem(BoardsEntity boards) {
        boolean success = repository.updateBoard(boards);

        if (!success) {
            return UpdateBoardResponse.fail();
        }

        return UpdateBoardResponse.success(boards.getId());
    }

    @Override
    @Transactional(readOnly = true)
//    @Cacheable(value="userBoards")
    public BoardListResponse selectUserBoardList() {
        List<BoardsEntity> boards = repository.selectUserBoardItems();

        return listMaker.makeBoardListMaker(boards);
    }
}
