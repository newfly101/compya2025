package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BoardMapper {

    List<BoardsEntity> selectBoards();
//    List<BoardsEntity> selectBoards(@Param("boardCode") String boardCode);

    int insertBoard(BoardsEntity board);

}
