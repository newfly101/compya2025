package com.dawne.com2usbaseball.domain.community.service.tag;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.TagResponse;

public interface TagService {

    ListResponse<TagResponse> getVisibleTagList();

    TagResponse getTagDetailByCode(String code);
}
