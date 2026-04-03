package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.dawne.com2usbaseball.domain.community.repository.mapper.TagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class TagRepository {

    private final TagMapper tagMapper;

    public List<TagEntity> getTagList() {
        return tagMapper.getTagList();
    }

    public List<TagEntity> getVisibleTagList() {
        return tagMapper.getVisibleTagList();
    }

    public TagEntity getTagDetail(Long id) {
        return tagMapper.getTagDetail(id);
    }

    public TagEntity getTagDetailByCode(String code) {
        return tagMapper.getTagDetailByCode(code);
    }

    public int insertTag(TagEntity entity) {
        return tagMapper.insertTag(entity);
    }

    public int updateTag(TagEntity entity) {
        return tagMapper.updateTag(entity);
    }

    public int updateTagVisible(Long id, Boolean isVisible) {
        return tagMapper.updateTagVisible(id, isVisible);
    }

    public int deleteTag(Long id) {
        return tagMapper.deleteTag(id);
    }
}
