package com.dawne.com2usbaseball.domain.event.repository.mapper;

import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EventMapper {

    // 공식 카페 기준 이벤트
    List<EventEntity> selectEventByExternal();                  // 이벤트 리스트 확인
    int insertEvent(EventEntity event);                         // 이벤트 추가
    int updateEventByExternal(EventEntity event);               // 이벤트 수정
    int updateEventVisible(
            @Param("id") Long id,
            @Param("visible") boolean visible);            // 이벤트 노출 값 수정

    // 사이트 기준 이벤트
    void selectEventByInternal();


}
