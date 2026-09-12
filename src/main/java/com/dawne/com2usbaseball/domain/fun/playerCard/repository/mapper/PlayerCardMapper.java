package com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardStatEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PlayerCardMapper {

    /** NORMAL 카드 전량(11,668건)을 캐시에 올리므로 조건이 없다. */
    List<PlayerCardEntity> findAll();

    /** 구단 하나(전체 연도)의 NORMAL 카드 스탯 + 구종. */
    List<PlayerCardStatEntity> findStatsByTeamCode(@Param("teamCode") String teamCode);

    /** 어드민 캐시 동기화가 구단별 캐시를 전부 다시 채울 때 순회할 목록. */
    List<String> findDistinctTeamCodes();
}
