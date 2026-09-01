package com.dawne.com2usbaseball.domain.fun.team.service;

import com.dawne.com2usbaseball.domain.fun.team.dto.mapstruct.FunTeamMapStruct;
import com.dawne.com2usbaseball.domain.fun.team.dto.response.FunTeamResponse;
import com.dawne.com2usbaseball.domain.fun.team.repository.FunTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FunTeamServiceImpl implements FunTeamService {

    private final FunTeamRepository funTeamRepository;
    private final FunTeamMapStruct mapper;

    @Override
    public List<FunTeamResponse> getAll() {
        return mapper.toResponseList(funTeamRepository.findAll());
    }

    @Override
    public List<FunTeamResponse> getByTeamCode(String teamCode) {
        return mapper.toResponseList(funTeamRepository.findByTeamCode(teamCode));
    }
}
