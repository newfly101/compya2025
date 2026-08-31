package com.dawne.com2usbaseball.domain.oauth.repository.mapper;

import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {

    Optional<UserEntity> selectUserByProvider(
            @Param("provider") String provider,
            @Param("providerId") String providerId
    );

    void insertUser(UserEntity user);

    void updateUserLogin(@Param("id") Long id);

    int updateNickname(@Param("id") Long id, @Param("nickname") String nickname);

    Optional<UserEntity> selectUserById(@Param("id") Long id);

    // Admin
    List<UserEntity> selectAdminUserList(
            @Param("nickname") String nickname,
            @Param("userRole") UserRole userRole,
            @Param("userStatus") UserStatus userStatus,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    int updateUserRole(@Param("id") Long id, @Param("userRole") UserRole userRole);

    int updateUserStatus(@Param("id") Long id, @Param("userStatus") UserStatus userStatus);
}
