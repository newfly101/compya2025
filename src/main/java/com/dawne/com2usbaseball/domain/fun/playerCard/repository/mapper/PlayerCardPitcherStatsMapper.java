package com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardPitcherStatsEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface PlayerCardPitcherStatsMapper {

    int insert(PlayerCardPitcherStatsEntity entity);

    int update(PlayerCardPitcherStatsEntity entity);

    int deleteByCardId(@Param("cardId") Long cardId);

    Optional<PlayerCardPitcherStatsEntity> findByCardId(@Param("cardId") Long cardId);
}
