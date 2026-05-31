package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.BoardEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface BoardMapper {

    List<BoardEntity> getBoardList();

    List<BoardEntity> getVisibleBoardList();

    Optional<BoardEntity> getBoardDetail(@Param("id") Long id);

    Optional<BoardEntity> getBoardDetailByCode(@Param("code") String code);

    int insertBoard(BoardEntity entity);

    int updateBoard(BoardEntity entity);

    int updateBoardVisible(@Param("id") Long id,
                           @Param("isVisible") Boolean isVisible);

    int deleteBoard(@Param("id") Long id);
}
