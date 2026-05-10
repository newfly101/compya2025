package com.dawne.com2usbaseball.domain.oauth.repository.mapper;

import com.dawne.com2usbaseball.domain.oauth.entity.RefreshTokenEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface RefreshTokenMapper {

    void insertRefreshToken(RefreshTokenEntity token);

    Optional<RefreshTokenEntity> selectActiveByHash(@Param("tokenHash") String tokenHash);

    int deleteByHash(@Param("tokenHash") String tokenHash);

    int deleteByUserId(@Param("userId") Long userId);

    int deleteExpired();
}
