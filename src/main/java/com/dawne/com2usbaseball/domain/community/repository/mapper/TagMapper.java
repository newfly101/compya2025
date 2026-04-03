package com.dawne.com2usbaseball.domain.community.repository.mapper;

import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TagMapper {

    List<TagEntity> getTagList();

    List<TagEntity> getVisibleTagList();

    TagEntity getTagDetail(@Param("id") Long id);

    TagEntity getTagDetailByCode(@Param("code") String code);

    int insertTag(TagEntity entity);

    int updateTag(TagEntity entity);

    int updateTagVisible(@Param("id") Long id,
                         @Param("isVisible") Boolean isVisible);

    int deleteTag(@Param("id") Long id);
}
