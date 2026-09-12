package com.dawne.com2usbaseball.domain.fun.playerCard.service;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.PlayerCardSnapshot;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.PlayerCardPitchResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.PlayerCardResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.PlayerCardStatResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardStatEntity;
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

    /**
     * 구단 하나(전체 연도)의 스탯 + 구종. 캐시 키는 구단코드별로 나뉜다 —
     * 화면이 구단을 고를 때마다 그 구단분만 새로 채우면 되고, 다른 구단 캐시는 건드리지 않는다.
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "playerCardStat", key = "#teamCode")
    public PlayerCardSnapshot<PlayerCardStatResponse> getStatsByTeam(String teamCode) {
        List<PlayerCardStatResponse> items = playerCardRepository.findStatsByTeamCode(teamCode)
                .stream()
                .map(PlayerCardServiceImpl::toStatResponse)
                .toList();
        return PlayerCardSnapshot.of(items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getTeamCodes() {
        return playerCardRepository.findDistinctTeamCodes();
    }

    private static PlayerCardStatResponse toStatResponse(PlayerCardStatEntity e) {
        boolean isPitcher = e.getPlayerRole() == PlayerRole.PITCHER;

        // 타자에게는 구종을 내려주지 않는다 — pitches 는 항상 빈 목록(null 아님)이라 null 로 바꿔야
        // 클래스 레벨 NON_NULL 로 응답에서 키째 빠진다.
        List<PlayerCardPitchResponse> pitches = isPitcher && !e.getPitches().isEmpty()
                ? e.getPitches().stream()
                .map(p -> new PlayerCardPitchResponse(p.getPitchCode(), p.getPitchGrade()))
                .toList()
                : null;

        return new PlayerCardStatResponse(
                e.getPlayerName(),
                e.getSeasonYear(),
                e.getPositionCode(),
                isPitcher ? "P" : "H",
                List.of(e.getStat1(), e.getStat2(), e.getStat3(), e.getStat4(), e.getStat5()),
                pitches
        );
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
