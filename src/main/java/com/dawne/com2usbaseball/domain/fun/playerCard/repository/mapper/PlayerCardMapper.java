package com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PlayerCardMapper {

    /** NORMAL 카드 전량(11,668건)을 캐시에 올리므로 조건이 없다. */
    List<PlayerCardEntity> findAll();
}
