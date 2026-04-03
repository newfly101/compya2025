package com.dawne.com2usbaseball.domain.community.service.board;

import com.dawne.com2usbaseball.domain.community.entity.BoardEntity;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.exception.CommunityException;
import com.dawne.com2usbaseball.domain.community.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;

    @Override
    public List<BoardEntity> getBoardList() {
        return boardRepository.getBoardList();
    }

    @Override
    public List<BoardEntity> getVisibleBoardList() {
        return boardRepository.getVisibleBoardList();
    }

    @Override
    public BoardEntity getBoardDetail(Long id) {
        BoardEntity board = boardRepository.getBoardDetail(id);
        if (board == null) {
            throw new CommunityException(CommunityMessages.COMMUNITY_BOARD_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return board;
    }

    @Override
    public BoardEntity getBoardDetailByCode(String code) {
        BoardEntity board = boardRepository.getBoardDetailByCode(code);
        if (board == null) {
            throw new CommunityException(CommunityMessages.COMMUNITY_BOARD_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return board;
    }

    @Override
    @Transactional
    public Long createBoard(BoardEntity entity) {
        if (entity.getIsDeleted() == null) {
            entity.setIsDeleted(false);
        }
        boardRepository.insertBoard(entity);
        return entity.getId();
    }

    @Override
    @Transactional
    public void updateBoard(Long id, BoardEntity entity) {
        BoardEntity current = getBoardDetail(id);

        current.setName(entity.getName());
        current.setDescription(entity.getDescription());
        current.setUserRoleType(entity.getUserRoleType());
        current.setReadRoleType(entity.getReadRoleType());
        current.setUseComment(entity.getUseComment());
        current.setUseLike(entity.getUseLike());
        current.setUseTag(entity.getUseTag());
        current.setIsVisible(entity.getIsVisible());
        current.setSortOrder(entity.getSortOrder());

        boardRepository.updateBoard(current);
    }

    @Override
    @Transactional
    public void updateBoardVisible(Long id, Boolean isVisible) {
        getBoardDetail(id);
        boardRepository.updateBoardVisible(id, isVisible);
    }

    @Override
    @Transactional
    public void deleteBoard(Long id) {
        getBoardDetail(id);
        boardRepository.deleteBoard(id);
    }
}
