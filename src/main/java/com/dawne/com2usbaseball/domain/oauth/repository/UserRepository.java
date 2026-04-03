package com.dawne.com2usbaseball.domain.oauth.repository;

import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
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

    public Optional<UserEntity> findById(Long userId) {
        return mapper.selectUserById(userId);
    }

    public void updateUserLastLogin(Long userId) {
        mapper.updateUserLogin(userId);
    }
}
