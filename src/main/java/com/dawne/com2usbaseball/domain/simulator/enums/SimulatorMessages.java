package com.dawne.com2usbaseball.domain.simulator.enums;

public enum SimulatorMessages {
    // 성공
    SIMULATOR_GET_SUCCESS,
    SIMULATOR_SAVE_SUCCESS,
    SIMULATOR_DELETE_SUCCESS,
    SIMULATOR_RECORD_SUCCESS,

    // 실패
    SIMULATOR_INVALID_TIER,       // 400 — 저장 기록에 등급 글자 없음
    SIMULATOR_NOT_FOUND,          // 404 — 레전드·스킬 id 없음
    SIMULATOR_STORE_UNAVAILABLE   // 503 — Valkey 장애
}
