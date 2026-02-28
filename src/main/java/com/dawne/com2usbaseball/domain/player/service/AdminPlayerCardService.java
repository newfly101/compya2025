package com.dawne.com2usbaseball.domain.player.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.player.dto.command.PlayerCardFormat;
import com.dawne.com2usbaseball.domain.player.dto.response.PlayerCardResponse;
import com.dawne.com2usbaseball.domain.player.enums.PlayerMessages;

public interface AdminPlayerCardService {

    ListResponse<PlayerCardResponse> getPlayerInfo();
    OperationResponse<PlayerMessages> createPlayerCardInfo(PlayerCardFormat format);
    OperationResponse<PlayerMessages> updatePlayerCard();

}
