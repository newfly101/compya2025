package com.dawne.com2usbaseball.domain.community.entity;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostTagEntity {
    private Long postId;
    private Long tagId;
}
