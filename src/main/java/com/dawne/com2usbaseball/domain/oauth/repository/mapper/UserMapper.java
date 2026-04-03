package com.dawne.com2usbaseball.domain.oauth.repository.mapper;

import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface UserMapper {

    Optional<UserEntity> selectUserByProvider(
            @Param("provider") String provider,
            @Param("providerId") String providerId
    );

    void insertUser(UserEntity user);

    void updateUserLogin(@Param("id") Long id);

    Optional<UserEntity> selectUserById(@Param("id") Long id);
}
