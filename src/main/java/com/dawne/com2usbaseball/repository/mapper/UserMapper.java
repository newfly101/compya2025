package com.dawne.com2usbaseball.repository.mapper;

import com.dawne.com2usbaseball.entity.UserEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface UserMapper {

    Optional<UserEntity> selectUserByProvider(String provider, String providerId);
    void insertUser(UserEntity user);
    void updateUserLogin(int id);
}
