package com.dawne.com2usbaseball.domain.player.service;

import com.dawne.com2usbaseball.domain.player.dto.response.LegendPlayerCardResponse;
import com.dawne.com2usbaseball.common.enums.Target;

import java.util.List;

public interface PlayerCardService {

    List<LegendPlayerCardResponse> getPlayerInfo(Target target);

}
