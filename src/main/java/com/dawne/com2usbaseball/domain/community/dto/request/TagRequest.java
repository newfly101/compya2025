package com.dawne.com2usbaseball.domain.community.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TagRequest {
    private String code;
    private String name;
    private String description;
    private Boolean isVisible;
}
