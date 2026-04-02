package com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardPositionsEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PlayerCardPositionsMapper {
    int insert(PlayerCardPositionsEntity entity);

    int update(PlayerCardPositionsEntity entity);

    int deleteById(@Param("id") Long id);

    int deleteByCardId(@Param("cardId") Long cardId);

    Optional<PlayerCardPositionsEntity> findById(@Param("id") Long id);

    List<PlayerCardPositionsEntity> findByCardId(@Param("cardId") Long cardId);

    List<PlayerCardPositionsEntity> findAll();

}
