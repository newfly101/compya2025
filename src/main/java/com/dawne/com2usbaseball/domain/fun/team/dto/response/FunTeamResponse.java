package com.dawne.com2usbaseball.domain.fun.team.dto.response;

/**
 * fun_teams 목록/단건 조회용. 같은 team_code 가 여러 행일 수 있다 (팀명 변경 이력).
 */
public record FunTeamResponse(
        Long id,
        String teamCode,
        String teamName,
        String cityName,
        Integer startYear,
        Integer endYear,
        String emblemUrl,
        Long latestTeamId
) {
}
