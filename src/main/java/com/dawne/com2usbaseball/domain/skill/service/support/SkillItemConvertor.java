package com.dawne.com2usbaseball.domain.skill.service.support;

import com.dawne.com2usbaseball.domain.skill.dto.response.SkillItemResponse;
import com.dawne.com2usbaseball.domain.player.entity.PlayerSkillsEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SkillItemConvertor {

    public List<SkillItemResponse> toItems(List<PlayerSkillsEntity> entities) {
        List<SkillItemResponse> items = new ArrayList<>();

        for (PlayerSkillsEntity entity : entities) {
            items.add(makeRecord(entity));
        }

        return items;
    }

    // Entity → Response 변환 (Service 책임)
    private SkillItemResponse makeRecord(PlayerSkillsEntity entity) {
        return new SkillItemResponse(
                entity.getId(),
                entity.getName(),
                entity.getGrade()
        );
    }

}
