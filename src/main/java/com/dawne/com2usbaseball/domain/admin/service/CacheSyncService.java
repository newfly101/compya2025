package com.dawne.com2usbaseball.domain.admin.service;

import com.dawne.com2usbaseball.domain.admin.dto.response.CacheSyncResultResponse;
import com.dawne.com2usbaseball.domain.admin.dto.response.CacheSyncTargetResponse;

import java.util.List;

public interface CacheSyncService {

    /** 동기화 가능한 캐시 대상 전체 목록. FE는 이 목록만으로 화면을 그린다. */
    List<CacheSyncTargetResponse> getTargets();

    /** 대상 하나를 비우고 DB에서 다시 읽어 캐시를 채운다. targetId는 getTargets()가 준 id만 허용한다. */
    CacheSyncResultResponse sync(String targetId);

    /** 전체 대상을 순서대로 동기화한다. 하나 실패해도 나머지는 계속 진행한다. */
    List<CacheSyncResultResponse> syncAll();
}
