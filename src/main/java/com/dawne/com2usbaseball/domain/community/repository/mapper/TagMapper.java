package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TagMapper {

    List<TagEntity> selectTags();

    int insertNewTag(TagEntity tags);
    int updateTag(TagEntity tags);

}
