package com.dawne.com2usbaseball.domain.community.service.tag;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.TagMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.ChangeTagVisibleRequest;
import com.dawne.com2usbaseball.domain.community.dto.request.TagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.TagResponse;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminTagServiceImpl implements AdminTagService {

    private final TagRepository tagRepository;
    private final TagMapStruct tagMapStruct;

    @Override
    public ListResponse<TagResponse> getTagList() {
        List<TagEntity> tagList = tagRepository.getTagList();
        return ListAssembler.assemble(tagList, tagMapStruct::toResponse);
    }

    @Override
    public TagResponse getTagDetail(Long id) {
        TagEntity entity = getTagEntity(id);
        return tagMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public TagResponse createTag(TagRequest request) {
        TagEntity exists = tagRepository.getTagDetailByCode(request.code());
        if (exists != null) {
            throw new BaseException(CommunityMessages.COMMUNITY_TAG_CODE_ALREADY_EXISTS, HttpStatus.CONFLICT);
        }

        TagEntity entity = tagMapStruct.toEntity(request);
        entity.setIsDeleted(false);

        if (entity.getIsVisible() == null) {
            entity.setIsVisible(true);
        }

        tagRepository.insertTag(entity);

        return tagMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public TagResponse updateTag(Long id, TagRequest request) {
        TagEntity entity = getTagEntity(id);
        tagMapStruct.updateFromRequest(request, entity);
        tagRepository.updateTag(entity);
        return tagMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public void updateTagVisible(Long id, ChangeTagVisibleRequest request) {
        getTagEntity(id);
        tagRepository.updateTagVisible(id, request.isVisible());
    }

    @Override
    @Transactional
    public void deleteTag(Long id) {
        getTagEntity(id);
        tagRepository.deleteTag(id);
    }

    private TagEntity getTagEntity(Long id) {
        TagEntity entity = tagRepository.getTagDetail(id);
        if (entity == null) {
            throw new BaseException(CommunityMessages.COMMUNITY_TAG_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return entity;
    }
}
