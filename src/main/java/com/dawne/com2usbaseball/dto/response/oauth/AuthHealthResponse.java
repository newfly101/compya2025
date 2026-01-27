package com.dawne.com2usbaseball.dto.response.oauth;

public record AuthHealthResponse(
        boolean authenticated,
        UserHealthResponse user,
        UserRoleResponse role
) {}
