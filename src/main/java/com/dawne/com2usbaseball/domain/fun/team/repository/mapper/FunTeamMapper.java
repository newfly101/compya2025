package com.dawne.com2usbaseball.domain.fun.team.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.team.entity.TeamEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * V2 `fun_teams` 조회.
 *
 * 이름에 Fun 을 붙인 것은 legacy `teams` 를 보는
 * {@code domain.player.repository.mapper.TeamMapper} 와 빈 이름이 부딪히기 때문이다.
 * MyBatis 가 패키지를 뺀 클래스 이름으로 빈을 등록해서, 같은 이름이면 기동 자체가 막힌다.
 *
 * 두 테이블(`teams` 20건 / `fun_teams` 20건)은 컬럼이 사실상 같고 병존 중이다.
 * 정리 시 한쪽으로 합치면서 이 매퍼도 함께 통합할 대상이다.
 * 근거: docs/global-guide/develop/specs/db/dead-suspects.md § 3
 */
@Mapper
public interface FunTeamMapper {

    /** 전체 목록. team_code, start_year 순으로 정렬한다. */
    List<TeamEntity> findAll();

    /** 해당 코드의 행 전부. 팀명 변경 이력이 있을 수 있어 List 로 반환한다. */
    List<TeamEntity> findByTeamCode(@Param("teamCode") String teamCode);
}
