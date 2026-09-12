package com.dawne.com2usbaseball.domain.fun.playerCard.service;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.PlayerCardSnapshot;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.PlayerCardResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.repository.PlayerCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 조회 전용. 캐시를 비우는 경로가 없어 운영자가 DB(선수 카드/레전드 재료)를 직접 고치면
 * 서버를 재시작해야 반영된다.
 */
@Service
@RequiredArgsConstructor
public class PlayerCardServiceImpl implements PlayerCardService {

    private final PlayerCardRepository playerCardRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "playerCard", key = "'public'")
    public PlayerCardSnapshot<PlayerCardResponse> getAll() {
        List<PlayerCardResponse> items = playerCardRepository.findAll()
                .stream()
                .map(PlayerCardServiceImpl::toResponse)
                .toList();
        return PlayerCardSnapshot.of(items);
    }

    private static PlayerCardResponse toResponse(PlayerCardEntity e) {
        boolean isMaterial = e.getLegendName() != null;

        return new PlayerCardResponse(
                e.getPlayerName(),
                e.getTeamCode(),
                e.getSeasonYear(),
                e.getPlayerRole() == PlayerRole.PITCHER ? "P" : "H",
                e.getPositionCode(),
                e.getSubPositionCode(),
                Boolean.TRUE.equals(e.getHasSignature()) ? 1 : 0,
                isMaterial ? 1 : null,
                isMaterial ? e.getLegendName() : null
        );
    }
}
