package com.dawne.com2usbaseball.domain.player.service;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.player.dto.command.PlayerCardFormat;
import com.dawne.com2usbaseball.domain.player.dto.response.PlayerCardResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.team.TeamResponse;
import com.dawne.com2usbaseball.domain.player.entity.HitterAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PitcherAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.player.entity.TeamsEntity;
import com.dawne.com2usbaseball.domain.player.enums.PlayerMessages;
import com.dawne.com2usbaseball.domain.player.repository.PlayerCardRepository;
import com.dawne.com2usbaseball.domain.player.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPlayerCardServiceImpl implements AdminPlayerCardService {

    private final PlayerCardRepository repository;
    private final TeamRepository teamRepository;

    /**
     * 미구현. interface 가 정의된 시점부터 채워질 예정.
     * 본 라운드에서는 결정 보류 → 호출 시 명시적 실패로 fail-fast.
     */
    @Override
    public ListResponse<PlayerCardResponse> getPlayerInfo() {
        throw new UnsupportedOperationException("getPlayerInfo() 는 아직 구현되지 않았습니다.");
    }

    @Override
    public ListResponse<TeamResponse> getAllPlayerTeamInfo() {
        List<TeamsEntity> teams = teamRepository.findAll();
        return ListAssembler.assemble(teams, TeamResponse::from);
    }

    @Override
    @Transactional
    public OperationResponse<PlayerMessages> createPlayerCardInfo(PlayerCardFormat format) {
        PlayerCardEntity card = format.entity();

        if (!repository.savePlayerCard(card)) {
            return OperationResponse.fail(PlayerMessages.PLAYER_FAILED);
        }

        PlayerMessages resultMessage = insertAttributes(format, card.getId());

        return OperationResponse.success(resultMessage, card.getId());
    }

    private PlayerMessages insertAttributes(PlayerCardFormat format, Long cardId) {

        if (!format.hasAttribute()) {
            return PlayerMessages.PLAYER_CREATED;
        }

        HitterAttributeEntity hitter = format.getHitterIfMatch();
        PitcherAttributeEntity pitcher = format.getPitcherIfMatch();

        boolean saved = false;

        if (hitter != null) {
            hitter.setCardId(cardId);
            saved = repository.saveHitterAttribute(hitter);
        } else if (pitcher != null) {
            pitcher.setCardId(cardId);
            saved = repository.savePitcherAttribute(pitcher);
        }

        return saved
                ? PlayerMessages.PLAYER_CREATED_WITH_ATTRIBUTE
                : PlayerMessages.PLAYER_CREATED_WITHOUT_ATTRIBUTE;
    }

    /**
     * 미구현. interface 가 정의된 시점부터 채워질 예정.
     * 본 라운드에서는 결정 보류 → 호출 시 명시적 실패로 fail-fast.
     */
    @Override
    public OperationResponse<PlayerMessages> updatePlayerCard() {
        throw new UnsupportedOperationException("updatePlayerCard() 는 아직 구현되지 않았습니다.");
    }
}
