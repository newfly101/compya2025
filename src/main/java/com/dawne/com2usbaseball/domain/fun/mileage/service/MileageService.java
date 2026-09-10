package com.dawne.com2usbaseball.domain.fun.mileage.service;

import com.dawne.com2usbaseball.domain.fun.mileage.dto.MileageSnapshot;
import com.dawne.com2usbaseball.domain.fun.mileage.dto.response.MileageSniperTargetResponse;

public interface MileageService {

    /** 마일리지 저격 대상 카드 전량(119건). 필터·정렬은 화면이 한다. */
    MileageSnapshot<MileageSniperTargetResponse> getSniperTargets();
}
