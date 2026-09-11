package com.dawne.com2usbaseball.domain.oauth.repository.mapper;

import com.dawne.com2usbaseball.domain.oauth.entity.UserOAuthAccountEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserOAuthAccountMapper {

    void insertOAuthAccount(UserOAuthAccountEntity account);
}
