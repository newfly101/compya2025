package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.service.support.CafeSyncResult;

public interface CafeSyncService {

    /** 수집 1회 실행 (스케줄·관리자 수동이 같은 코드). 이미 실행 중이면 409. */
    CafeSyncResult syncNow();

    /** 수집 이벤트 1건의 본문을 원문 기준으로 다시 반영 ("본문 갱신") */
    EventResponse refreshEvent(Long id);
}
