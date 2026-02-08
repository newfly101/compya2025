package com.dawne.com2usbaseball.domain.community.service.tag;

import com.dawne.com2usbaseball.common.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.tag.TagListResponse;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.TagRepository;
import com.dawne.com2usbaseball.domain.community.service.tag.support.ListMaker;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TagServiceImpl implements TagService {

    private final TagRepository repository;
    @Resource(name = "tagListMaker")
    private final ListMaker listMaker;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value="adminTags")
    public TagListResponse selectTagList() {
        List<TagEntity> tags = repository.selectTagItems();

        return listMaker.makeTagListMaker(tags);
    }

    @Override
    @CacheEvict(value="adminTags", allEntries = true)
    public OperationResponse<CommunityMessages> createNewTagItem(TagEntity tags) {
        return repository.insertNewTag(tags)
                ? OperationResponse.success(CommunityMessages.TAG_CREATED, tags.getId())
                : OperationResponse.fail(CommunityMessages.TAG_FAILED);
    }

    @Override
    @CacheEvict(value="adminTags", allEntries = true)
    public OperationResponse<CommunityMessages> updateTagItem(TagEntity tags) {
        return repository.updateTag(tags)
                ? OperationResponse.success(CommunityMessages.TAG_UPDATED, tags.getId())
                : OperationResponse.fail(CommunityMessages.TAG_FAILED);
    }
}
