package com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardPitcherPitchGradesEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface PlayerCardPitcherPitchGradesMapper {
    int insert(PlayerCardPitcherPitchGradesEntity entity);

    int update(PlayerCardPitcherPitchGradesEntity entity);

    int deleteByCardId(@Param("cardId") Long cardId);

    Optional<PlayerCardPitcherPitchGradesEntity> findByCardId(@Param("cardId") Long cardId);

}
