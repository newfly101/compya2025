package com.dawne.com2usbaseball.domain.legendCollection.entity;

import lombok.*;
import com.dawne.com2usbaseball.domain.legendCollection.enums.MaterialState;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MaterialStateEntity {
    private String materialId;
    private MaterialState state;
}
