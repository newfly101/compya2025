package com.dawne.com2usbaseball.domain.oauth.dto.response;

public record AuthHealthResponse(
        boolean authenticated,
        UserHealthResponse user,
        UserRoleResponse role
) {}
