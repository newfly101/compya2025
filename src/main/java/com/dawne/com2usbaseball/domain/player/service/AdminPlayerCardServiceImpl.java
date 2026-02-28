package com.dawne.com2usbaseball.domain.player.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.player.dto.command.PlayerCardFormat;
import com.dawne.com2usbaseball.domain.player.dto.response.PlayerCardResponse;
import com.dawne.com2usbaseball.domain.player.entity.HitterAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PitcherAttributeEntity;
import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.player.enums.PlayerMessages;
import com.dawne.com2usbaseball.domain.player.repository.PlayerCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminPlayerCardServiceImpl implements AdminPlayerCardService {

    private final PlayerCardRepository repository;

    @Override
    public ListResponse<PlayerCardResponse> getPlayerInfo() {
        return null;
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

    protected PlayerMessages insertAttributes(PlayerCardFormat format, Long cardId) {

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

    @Override
    public OperationResponse<PlayerMessages> updatePlayerCard() {
        return null;
    }
}
