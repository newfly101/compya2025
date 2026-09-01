package com.dawne.com2usbaseball.domain.fun.team.repository;

import com.dawne.com2usbaseball.domain.fun.team.entity.TeamEntity;
import com.dawne.com2usbaseball.domain.fun.team.repository.mapper.FunTeamMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FunTeamRepository {

    private final FunTeamMapper funTeamMapper;

    public List<TeamEntity> findAll() {
        return funTeamMapper.findAll();
    }

    public List<TeamEntity> findByTeamCode(String teamCode) {
        return funTeamMapper.findByTeamCode(teamCode);
    }
}
