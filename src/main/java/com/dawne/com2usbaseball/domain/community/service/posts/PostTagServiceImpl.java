package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.PostTagMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.response.PostTagResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostTagEntity;
import com.dawne.com2usbaseball.domain.community.repository.PostTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostTagServiceImpl implements PostTagService {

    private final PostTagRepository postTagRepository;
    private final PostTagMapStruct postTagMapStruct;

    @Override
    public ListResponse<PostTagResponse> getPostTagListByPostId(Long postId) {
        List<PostTagEntity> postTagList = postTagRepository.getPostTagListByPostId(postId);
        return ListAssembler.assemble(postTagList, postTagMapStruct::toResponse);
    }

    @Override
    public ListResponse<PostTagResponse> getPostTagListByTagId(Long tagId) {
        List<PostTagEntity> postTagList = postTagRepository.getPostTagListByTagId(tagId);
        return ListAssembler.assemble(postTagList, postTagMapStruct::toResponse);
    }
}
