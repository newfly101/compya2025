package com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardHitterStatsEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface PlayerCardHitterStatsMapper {
    int insert(PlayerCardHitterStatsEntity entity);

    int update(PlayerCardHitterStatsEntity entity);

    int deleteByCardId(@Param("cardId") Long cardId);

    Optional<PlayerCardHitterStatsEntity> findByCardId(@Param("cardId") Long cardId);

}
