package com.dawne.com2usbaseball.domain.player.repository;

import com.dawne.com2usbaseball.domain.player.entity.HitterAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PitcherAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.player.repository.mapper.PlayerCardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PlayerCardRepository {

    private final PlayerCardMapper cardMapper;

    public boolean savePlayerCard(PlayerCardEntity card) {
        return cardMapper.insertPlayerCard(card) > 0;
    }

    public boolean saveHitterAttribute(HitterAttributeEntity hitter) {
        return cardMapper.insertHitterAttribute(hitter) > 0;
    }

    public boolean savePitcherAttribute(PitcherAttributeEntity pitcher) {
        return cardMapper.insertPitcherAttribute(pitcher) > 0;
    }

}
