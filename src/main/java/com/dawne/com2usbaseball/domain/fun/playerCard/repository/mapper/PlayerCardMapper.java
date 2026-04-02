package com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper;

import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PlayerCardMapper {
    int insert(PlayerCardEntity entity);

    int update(PlayerCardEntity entity);

    int deleteById(@Param("id") Long id);

    Optional<PlayerCardEntity> findById(@Param("id") Long id);

    Optional<PlayerCardEntity> findByCardCode(@Param("cardCode") String cardCode);

    List<PlayerCardEntity> findAll();

}
