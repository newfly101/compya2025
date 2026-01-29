package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.entity.UserRoleEntity;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;


    @Transactional
    public UserEntity findOrCreateNaverUser(NaverOAuthUserResponse info) {
        UserEntity user = repository
                .findByProviderAndProviderId("NAVER", info.id())
                .orElseGet(() -> repository.save(
                        createUser(info)
                ));

        if (!repository.checkIsExistRole(user.getId())) {
            repository.saveRole(user.getId());
        }

        repository.updateUserLastLogin(user.getId());

        return user;
    }

    @Override
    public UserEntity createUser(NaverOAuthUserResponse info) {
        UserEntity user = new UserEntity();
        user.setProvider("NAVER");
        user.setProviderId(info.id());
        user.setOauthNickname(info.nickname());
        user.setOauthEmail(info.email());
        user.setOauthProfileImage(info.profileImage());
        user.setOauthAgeRange(info.ageRange());
        user.setNickname(info.nickname());
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public UserEntity findActiveUserById(int userId) {
        return repository.findById(userId)
                .orElseThrow(() ->
                        new IllegalStateException("존재하지 않는 사용자"));
    }

    @Override
    public UserRoleEntity findUserRoleByUserId(int userId) {
        return repository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException("권한 정보 없음"));
    }
}
