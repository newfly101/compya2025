package com.dawne.com2usbaseball.domain.simulator.repository.mapper;

import com.dawne.com2usbaseball.domain.simulator.entity.SimulatorSaveEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SimulatorMapper {

    /** 이메일이 있는 연동 계정 중 id 가장 작은 행의 이메일. 없으면 null. */
    String selectEmailByUserId(@Param("userId") Long userId);

    int countLegend(@Param("legendId") String legendId);

    int countSkills(@Param("ids") List<String> ids);

    int insertSave(SimulatorSaveEntity entity);
}
