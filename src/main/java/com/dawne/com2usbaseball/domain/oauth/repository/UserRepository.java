package com.dawne.com2usbaseball.domain.oauth.repository;

import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import com.dawne.com2usbaseball.domain.oauth.repository.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepository {

    private final UserMapper mapper;

    public Optional<UserEntity> findByProviderAndProviderId(String provider, String providerId) {
        return mapper.selectUserByProvider(provider, providerId);
    }

    public UserEntity save(UserEntity user) {
        mapper.insertUser(user);
        return user;
    }

    public Optional<UserEntity> findById(Long userId) {
        return mapper.selectUserById(userId);
    }

    public void updateUserLastLogin(Long userId) {
        mapper.updateUserLogin(userId);
    }

    public boolean updateNickname(Long userId, String nickname) {
        return mapper.updateNickname(userId, nickname) > 0;
    }

    public List<UserEntity> findAdminUserList(String nickname, UserRole userRole, UserStatus userStatus, int limit, int offset) {
        return mapper.selectAdminUserList(nickname, userRole, userStatus, limit, offset);
    }

    public boolean updateUserRole(Long userId, UserRole userRole) {
        return mapper.updateUserRole(userId, userRole) > 0;
    }

    public boolean updateUserStatus(Long userId, UserStatus userStatus) {
        return mapper.updateUserStatus(userId, userStatus) > 0;
    }
}
