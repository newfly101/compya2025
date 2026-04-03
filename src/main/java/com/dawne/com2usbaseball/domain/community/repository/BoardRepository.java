package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.BoardEntity;
import com.dawne.com2usbaseball.domain.community.repository.mapper.BoardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class BoardRepository {

    private final BoardMapper boardMapper;

    public List<BoardEntity> getBoardList() {
        return boardMapper.getBoardList();
    }

    public List<BoardEntity> getVisibleBoardList() {
        return boardMapper.getVisibleBoardList();
    }

    public BoardEntity getBoardDetail(Long id) {
        return boardMapper.getBoardDetail(id);
    }

    public BoardEntity getBoardDetailByCode(String code) {
        return boardMapper.getBoardDetailByCode(code);
    }

    public boolean insertBoard(BoardEntity entity) {
        return boardMapper.insertBoard(entity) > 0;
    }

    public boolean updateBoard(BoardEntity entity) {
        return boardMapper.updateBoard(entity) > 0;
    }

    public boolean updateBoardVisible(Long id, Boolean isVisible) {
        return boardMapper.updateBoardVisible(id, isVisible) > 0;
    }

    public boolean deleteBoard(Long id) {
        return boardMapper.deleteBoard(id) > 0;
    }
}
