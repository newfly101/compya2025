package com.dawne.com2usbaseball.service.skills;

import com.dawne.com2usbaseball.dto.response.skills.SkillItemResponse;
import com.dawne.com2usbaseball.enums.Grade;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class SkillGradeGrouper {

    public Map<Grade, List<SkillItemResponse>> gradeListMap(
            List<SkillItemResponse> items
    ) {
        Map<Grade, List<SkillItemResponse>> grouped = new HashMap<>();

        for (SkillItemResponse item : items) {
            grouped
                    .computeIfAbsent(item.grade(), k -> new ArrayList<>())
                    .add(item);
        }

        return grouped;
    }

}
