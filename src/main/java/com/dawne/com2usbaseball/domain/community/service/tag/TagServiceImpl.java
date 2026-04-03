package com.dawne.com2usbaseball.domain.community.service.tag;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.TagMapStruct;
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
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final TagMapStruct tagMapStruct;

    @Override
    public ListResponse<TagResponse> getVisibleTagList() {
        List<TagEntity> tagList = tagRepository.getVisibleTagList();
        return ListAssembler.assemble(tagList, tagMapStruct::toResponse);
    }

    @Override
    public TagResponse getTagDetailByCode(String code) {
        TagEntity entity = tagRepository.getTagDetailByCode(code);
        if (entity == null) {
            throw new BaseException(CommunityMessages.COMMUNITY_TAG_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        return tagMapStruct.toResponse(entity);
    }
}
