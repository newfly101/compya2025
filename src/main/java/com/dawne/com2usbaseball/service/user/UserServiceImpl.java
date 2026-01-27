package com.dawne.com2usbaseball.service.user;

import com.dawne.com2usbaseball.dto.response.oauth.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.entity.UserEntity;
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
        user.setEmail(info.email());
        user.setNickname(info.nickname());
        user.setProfileImage(info.profileImage());
        user.setYear(info.year());
        user.setPhoneNumber(info.phoneNumber());
        user.setGender(info.gender());
        return user;
    }
}
