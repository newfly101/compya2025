package com.dawne.com2usbaseball.domain.fun.playerCard.repository;

import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper.FunPlayerCardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class FunPlayerCardRepository {
    private final FunPlayerCardMapper playerCardMapper;

    public Long insert(PlayerCardEntity entity) {
        playerCardMapper.insert(entity);
        return entity.getId();
    }

    public int update(PlayerCardEntity entity) {
        return playerCardMapper.update(entity);
    }

    public int deleteById(Long id) {
        return playerCardMapper.deleteById(id);
    }

    public Optional<PlayerCardEntity> findById(Long id) {
        return playerCardMapper.findById(id);
    }

    public Optional<PlayerCardEntity> findByCardCode(String cardCode) {
        return playerCardMapper.findByCardCode(cardCode);
    }

    public List<PlayerCardEntity> findAll() {
        return playerCardMapper.findAll();
    }
}
