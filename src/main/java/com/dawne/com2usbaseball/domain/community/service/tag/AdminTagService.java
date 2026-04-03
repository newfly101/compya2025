package com.dawne.com2usbaseball.domain.community.service.tag;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.ChangeTagVisibleRequest;
import com.dawne.com2usbaseball.domain.community.dto.request.TagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.TagResponse;

public interface AdminTagService {

    ListResponse<TagResponse> getTagList();

    TagResponse getTagDetail(Long id);

    TagResponse createTag(TagRequest request);

    TagResponse updateTag(Long id, TagRequest request);

    void updateTagVisible(Long id, ChangeTagVisibleRequest request);

    void deleteTag(Long id);
}
