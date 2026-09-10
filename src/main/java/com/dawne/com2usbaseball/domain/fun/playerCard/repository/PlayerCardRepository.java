package com.dawne.com2usbaseball.domain.fun.playerCard.repository;

import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper.PlayerCardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PlayerCardRepository {

    private final PlayerCardMapper playerCardMapper;

    public List<PlayerCardEntity> findAll() {
        return playerCardMapper.findAll();
    }
}
