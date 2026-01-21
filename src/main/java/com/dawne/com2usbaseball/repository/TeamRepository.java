package com.dawne.com2usbaseball.repository;

import com.dawne.com2usbaseball.entity.TeamsEntity;
import com.dawne.com2usbaseball.repository.mapper.TeamMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class TeamRepository {

    private final TeamMapper mapper;

    public TeamsEntity findTeamById(Long id) {
        return mapper.selectTeamById(id);
    }

    public List<TeamsEntity> findAll() {
        return mapper.selectTeamAll();
    }
}
