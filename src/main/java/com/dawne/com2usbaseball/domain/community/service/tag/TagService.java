package com.dawne.com2usbaseball.domain.community.service.tag;

import com.dawne.com2usbaseball.common.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.tag.TagListResponse;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;

public interface TagService {

    TagListResponse selectTagList();
    OperationResponse<CommunityMessages> createNewTagItem(TagEntity boards);
    OperationResponse<CommunityMessages> updateTagItem(TagEntity boards);
}
