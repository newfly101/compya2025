package com.dawne.com2usbaseball.domain.fun.playerCard.service;

import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardCreateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardUpdateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.FunPlayerCardResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;

import java.util.List;

public interface FunPlayerCardService {
    Long create(FunPlayerCardCreateRequest request);

    void update(Long id, FunPlayerCardUpdateRequest request);

    void delete(Long id);

    FunPlayerCardResponse getById(Long id);

    PlayerCardEntity getByCardCode(String cardCode);

    List<FunPlayerCardResponse> getAll();
}
