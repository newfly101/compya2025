package com.dawne.com2usbaseball.domain.community.service.tag;

import com.dawne.com2usbaseball.domain.community.dto.response.tag.InsertTagResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.tag.TagListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.tag.UpdateTagResponse;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;

public interface TagService {

    TagListResponse selectTagList();
    InsertTagResponse createNewTagItem(TagEntity boards);
    UpdateTagResponse updateTagItem(TagEntity boards);
}
