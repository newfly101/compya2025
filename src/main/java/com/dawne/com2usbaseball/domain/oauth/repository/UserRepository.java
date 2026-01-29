package com.dawne.com2usbaseball.domain.oauth.repository;

import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.entity.UserRoleEntity;
import com.dawne.com2usbaseball.domain.oauth.repository.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

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
    public Optional<UserEntity> findById(int userId) {
        return mapper.selectUserById(userId);
    }

    public Optional<UserRoleEntity> findByUserId(int userId) {
        return mapper.selectUserRoleByUserId(userId);
    }

    public void updateUserLastLogin(int userId) {
        mapper.updateUserLogin(userId);
    }

    public boolean checkIsExistRole(int userId) {
        return mapper.countUserRoleByUserId(userId) > 0;
    }

    public void saveRole(int userId) {
        mapper.insertUserRole(userId);
    }
}
