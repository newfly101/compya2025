package com.dawne.com2usbaseball.domain.admin.enums;

public enum CacheSyncMessages {
    CACHE_SYNC_TARGETS_SUCCESS,
    CACHE_SYNC_SUCCESS,
    CACHE_SYNC_ALL_SUCCESS,

    // 서버가 아는 목록 밖의 임의 문자열이 들어온 경우
    CACHE_SYNC_TARGET_NOT_FOUND,

    // 캐시는 비웠으나 DB 재조회(다시 채우기) 중 실패한 경우
    CACHE_SYNC_FAILED
}
