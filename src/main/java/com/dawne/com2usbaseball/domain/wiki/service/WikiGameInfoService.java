package com.dawne.com2usbaseball.domain.wiki.service;

import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiGameInfoResponse;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;

public interface WikiGameInfoService {
    WikiGameInfoResponse getGameInfo(WikiTarget target);
}
