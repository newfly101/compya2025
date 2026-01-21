package com.dawne.com2usbaseball.service.player;

import com.dawne.com2usbaseball.dto.response.playerInfo.PlayerCardResponse;
import com.dawne.com2usbaseball.enums.Target;

import java.util.List;

public interface PlayerCardService {

    List<PlayerCardResponse> getPlayerInfo(Target target);

}
