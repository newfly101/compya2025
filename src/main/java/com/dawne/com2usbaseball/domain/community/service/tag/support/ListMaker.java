package com.dawne.com2usbaseball.domain.community.service.tag.support;

import com.dawne.com2usbaseball.domain.community.dto.response.tag.TagListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.tag.TagResponse;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("tagListMaker")
public class ListMaker {

    public TagListResponse makeTagListMaker(List<TagEntity> tagLists) {
        List<TagResponse> tags = tagLists.stream()
                .map(TagResponse::from)
                .toList();

        return TagListResponse.of(tags);
    }
}
