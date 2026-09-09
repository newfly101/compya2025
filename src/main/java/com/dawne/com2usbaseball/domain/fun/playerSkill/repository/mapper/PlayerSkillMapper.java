package com.dawne.com2usbaseball.domain.fun.playerSkill.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.playerSkill.entity.PlayerSkillEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PlayerSkillMapper {

    /**
     * role 별 46건 전량 + 티어 + 수치를 한 번에. 캐시에 올리므로 다른 조건은 없다.
     * role 은 항상 서버 내부 상수(HITTER/PITCHER)만 넘어오므로 검증하지 않는다.
     */
    List<PlayerSkillEntity> findByRole(@Param("role") String role);
}
