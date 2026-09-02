package com.dawne.com2usbaseball.domain.fun.legendStat.service;

import com.dawne.com2usbaseball.domain.fun.legendStat.dto.LegendStatSnapshot;
import com.dawne.com2usbaseball.domain.fun.legendStat.dto.response.FunLegendStatResponse;
import com.dawne.com2usbaseball.domain.fun.legendStat.dto.response.FunPitchTypeResponse;

public interface FunLegendStatService {

    /** 레전드 74명 전량. 필터·정렬은 화면이 한다. */
    LegendStatSnapshot<FunLegendStatResponse> getAll();

    LegendStatSnapshot<FunPitchTypeResponse> getPitchTypes();
}
