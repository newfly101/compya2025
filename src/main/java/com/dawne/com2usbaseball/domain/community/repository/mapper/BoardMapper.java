package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.BoardEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardMapper {

    List<BoardEntity> getBoardList();

    List<BoardEntity> getVisibleBoardList();

    BoardEntity getBoardDetail(@Param("id") Long id);

    BoardEntity getBoardDetailByCode(@Param("code") String code);

    int insertBoard(BoardEntity entity);

    int updateBoard(BoardEntity entity);

    int updateBoardVisible(@Param("id") Long id,
                           @Param("isVisible") Boolean isVisible);

    int deleteBoard(@Param("id") Long id);
}
