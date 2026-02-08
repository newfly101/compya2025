package com.dawne.com2usbaseball.domain.community.service.board;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardRepository repository;

    @Override
    @Transactional(readOnly = true)
    public ListResponse<BoardResponse> selectBoardList() {
        List<BoardsEntity> boards = repository.selectBoardItems();

        return ListAssembler.assemble(boards, BoardResponse::from);
    }

    @Override
    @CacheEvict(value = "adminBoards", allEntries = true)
    public OperationResponse<CommunityMessages> createNewBoardItem(BoardsEntity boards) {
        return repository.insertNewBoard(boards)
                ? OperationResponse.success(CommunityMessages.BOARD_CREATED, boards.getId())
                : OperationResponse.fail(CommunityMessages.BOARD_FAILED);
    }

    @Override
    @CacheEvict(value = "adminBoards", allEntries = true)
    public OperationResponse<CommunityMessages> updateBoardItem(BoardsEntity boards) {
        return repository.updateBoard(boards)
                ? OperationResponse.success(CommunityMessages.BOARD_UPDATED, boards.getId())
                : OperationResponse.fail(CommunityMessages.BOARD_FAILED);
    }

    @Override
    @Transactional(readOnly = true)
//    @Cacheable(value="userBoards")
    public ListResponse<BoardResponse> selectUserBoardList() {
        List<BoardsEntity> boards = repository.selectUserBoardItems();

        return ListAssembler.assemble(boards, BoardResponse::from);
    }
}
