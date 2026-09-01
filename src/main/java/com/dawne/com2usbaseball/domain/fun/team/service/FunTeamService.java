package com.dawne.com2usbaseball.domain.fun.team.service;

import com.dawne.com2usbaseball.domain.fun.team.dto.response.FunTeamResponse;

import java.util.List;

public interface FunTeamService {

    /** 전체 목록. team_code, start_year 순으로 정렬한다. */
    List<FunTeamResponse> getAll();

    /** 해당 코드의 행 전부. 팀명 변경 이력이 있을 수 있어 List 로 반환한다. */
    List<FunTeamResponse> getByTeamCode(String teamCode);
}
