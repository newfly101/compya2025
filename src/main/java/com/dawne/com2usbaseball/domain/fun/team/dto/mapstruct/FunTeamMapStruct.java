package com.dawne.com2usbaseball.domain.fun.team.dto.mapstruct;

import com.dawne.com2usbaseball.domain.fun.team.dto.response.FunTeamResponse;
import com.dawne.com2usbaseball.domain.fun.team.entity.TeamEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FunTeamMapStruct {

    FunTeamResponse toResponse(TeamEntity entity);

    List<FunTeamResponse> toResponseList(List<TeamEntity> entities);
}
