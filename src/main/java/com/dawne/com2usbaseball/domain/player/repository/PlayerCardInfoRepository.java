package com.dawne.com2usbaseball.domain.player.repository;

import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.player.repository.mapper.PlayerCardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PlayerCardInfoRepository {

    private final PlayerCardMapper mapper;

    public List<PlayerCardEntity> findAllPlayerCardInfoByPosition (Target target) {
        return mapper.selectPlayersByPosition(target);
    }
}
