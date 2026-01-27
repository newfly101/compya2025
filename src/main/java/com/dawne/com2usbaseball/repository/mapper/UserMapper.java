package com.dawne.com2usbaseball.repository.mapper;

import com.dawne.com2usbaseball.entity.UserEntity;
import com.dawne.com2usbaseball.entity.UserRoleEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface UserMapper {

    Optional<UserEntity> selectUserByProvider(String provider, String providerId);
    void insertUser(UserEntity user);
    void updateUserLogin(int id);

    // 사용자 존재 여부 확인
    int countUserRoleByUserId(int userId);

    // userRole 추가
    void insertUserRole(int userId);

    // Health 용
    Optional<UserEntity> selectUserById(int userId);
    Optional<UserRoleEntity> selectUserRoleByUserId(int userId);
}
