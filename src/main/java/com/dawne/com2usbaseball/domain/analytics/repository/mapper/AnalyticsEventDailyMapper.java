package com.dawne.com2usbaseball.domain.analytics.repository.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;

@Mapper
public interface AnalyticsEventDailyMapper {

    /** PAGE_VIEW/OUTBOUND_CLICK 을 (event_type, page_path) 로 묶어 그 날짜 집계행을 채운다. 재실행 안전. */
    int aggregatePageEvents(@Param("date") LocalDate date);

    /** CONTENT_CLICK 을 (content_type, content_id) 로 묶어 그 날짜 집계행을 채운다. 재실행 안전. */
    int aggregateContentEvents(@Param("date") LocalDate date);

    /** 기기별 순방문자·페이지뷰(30초 중복 제거)를 그 날짜로 채운다. 재실행 안전. */
    int aggregateDeviceDaily(@Param("date") LocalDate date);

    /** 세션 수·페이지뷰(30초 중복 제거)·순방문자를 그 날짜 한 행으로 채운다. 재실행 안전. */
    int aggregateSessionDaily(@Param("date") LocalDate date);

    /** 외부 유입 호스트별 방문 수를 그 날짜로 채운다. 재실행 안전. */
    int aggregateReferrerDaily(@Param("date") LocalDate date);
}
