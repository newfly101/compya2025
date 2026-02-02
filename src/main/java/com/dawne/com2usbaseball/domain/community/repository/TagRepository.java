package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.dawne.com2usbaseball.domain.community.repository.mapper.TagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@RequiredArgsConstructor
@Repository
public class TagRepository {

    private final TagMapper mapper;

    public List<TagEntity> selectTagItems() {
        return mapper.selectTags();
    }

    public boolean insertNewTag(TagEntity tags) {
        return mapper.insertNewTag(tags) > 0;
    }

    public boolean updateTag(TagEntity tags) {
        return mapper.updateTag(tags) > 0;
    }
}
