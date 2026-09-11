package com.dawne.com2usbaseball.domain.oauth.repository;

import com.dawne.com2usbaseball.domain.oauth.entity.UserOAuthAccountEntity;
import com.dawne.com2usbaseball.domain.oauth.repository.mapper.UserOAuthAccountMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserOAuthAccountRepository {

    private final UserOAuthAccountMapper mapper;

    public UserOAuthAccountEntity save(UserOAuthAccountEntity account) {
        mapper.insertOAuthAccount(account);
        return account;
    }
}
