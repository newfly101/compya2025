package com.dawne.com2usbaseball.domain.community.service.tag;

import com.dawne.com2usbaseball.domain.community.dto.response.tag.InsertTagResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.tag.TagListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.tag.UpdateTagResponse;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.dawne.com2usbaseball.domain.community.repository.TagRepository;
import com.dawne.com2usbaseball.domain.community.service.tag.support.ListMaker;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository repository;
    @Resource(name = "tagListMaker")
    private final ListMaker listMaker;

    @Override
    public TagListResponse selectTagList() {
        List<TagEntity> tags = repository.selectTagItems();

        return listMaker.makeTagListMaker(tags);
    }

    @Override
    public InsertTagResponse createNewTagItem(TagEntity tags) {
        boolean success = repository.insertNewTag(tags);

        if (!success) {
            return InsertTagResponse.fail();
        }

        return InsertTagResponse.success(tags.getId());
    }

    @Override
    public UpdateTagResponse updateTagItem(TagEntity tags) {
        boolean success = repository.updateTag(tags);

        if (!success) {
            return UpdateTagResponse.fail();
        }

        return UpdateTagResponse.success(tags.getId());
    }
}
