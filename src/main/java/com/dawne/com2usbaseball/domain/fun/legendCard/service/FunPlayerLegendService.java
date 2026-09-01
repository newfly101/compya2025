package com.dawne.com2usbaseball.domain.fun.legendCard.service;

import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendDetailResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendMaterialResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendResponse;

import java.util.List;

public interface FunPlayerLegendService {

    /** 레전드 목록. 조건은 전부 선택이며 null 이면 걸지 않는다. */
    List<FunPlayerLegendResponse> getAll(String teamCode, String legendType, String playerRole);

    /** 레전드 단건 + 재료 8행. */
    FunPlayerLegendDetailResponse getById(String id);

    /** 특정 레전드의 재료만. */
    List<FunPlayerLegendMaterialResponse> getMaterials(String legendId);

    /** 목록 + 재료를 한 번에 — 화면 초기 로딩용. */
    List<FunPlayerLegendDetailResponse> getAllWithMaterials(String teamCode, String legendType, String playerRole);
}
