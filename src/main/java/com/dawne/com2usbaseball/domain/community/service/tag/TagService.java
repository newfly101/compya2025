package com.dawne.com2usbaseball.domain.community.service.tag;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.TagResponse;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;

public interface TagService {

    ListResponse<TagResponse> selectTagList();
    OperationResponse<CommunityMessages> createNewTagItem(TagEntity boards);
    OperationResponse<CommunityMessages> updateTagItem(TagEntity boards);
}
