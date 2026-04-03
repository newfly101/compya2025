package com.dawne.com2usbaseball.domain.community.dto.request;

public record TagRequest (
    String code,
    String name,
    String description,
    Boolean isVisible
){ }
