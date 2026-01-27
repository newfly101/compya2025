package com.dawne.com2usbaseball.service.user;

import com.dawne.com2usbaseball.dto.response.oauth.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.entity.UserEntity;
import com.dawne.com2usbaseball.entity.UserRoleEntity;
import com.dawne.com2usbaseball.enums.user.UserStatus;
import com.dawne.com2usbaseball.repository.UserRepository;
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
        user.setNickname(info.nickname());
        user.setEmail(info.email());
        user.setProfileImage(info.profileImage());
        user.setAgeRange(info.ageRange());
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public UserEntity findActiveUserById(int userId) {
        UserEntity user = repository.findById(userId)
                .orElseThrow(() ->
                        new IllegalStateException("존재하지 않는 사용자"));

        UserRoleEntity role = repository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException("권한 정보 없음"));

        if (role.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException("로그인 불가 상태: " + role.getStatus());
        }

        return user;
    }
}
