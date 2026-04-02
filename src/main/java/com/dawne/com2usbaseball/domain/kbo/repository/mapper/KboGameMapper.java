package com.dawne.com2usbaseball.domain.kbo.repository.mapper;

import com.dawne.com2usbaseball.domain.kbo.entity.KboGameEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface KboGameMapper {

    /** 특정 날짜 경기 목록 (취소 제외, 시간순) */
    List<KboGameEntity> selectGamesByDate(@Param("gameDate") LocalDate gameDate);

    /** 경기 단건 조회 */
    KboGameEntity selectGameById(@Param("gameId") String gameId);

    /**
     * 특정 팀의 최근 N경기 결과 조회
     * - gameDate 기준 이전 완료 경기(RESULT)만 대상
     * - 반환값: "W" | "L" | "D"
     */
    List<String> selectRecentResults(
            @Param("teamCode") String teamCode,
            @Param("gameDate") LocalDate gameDate
    );
}
