package com.dawne.com2usbaseball.repository;

import com.dawne.com2usbaseball.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.enums.Target;
import com.dawne.com2usbaseball.repository.mapper.PlayerCardMapper;
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
