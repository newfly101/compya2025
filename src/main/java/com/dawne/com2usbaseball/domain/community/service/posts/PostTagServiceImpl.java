package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.PostTagMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.PostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.request.ReplacePostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostTagResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostEntity;
import com.dawne.com2usbaseball.domain.community.entity.PostTagEntity;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.PostRepository;
import com.dawne.com2usbaseball.domain.community.repository.PostTagRepository;
import com.dawne.com2usbaseball.domain.community.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostTagServiceImpl implements PostTagService {

    private final PostTagRepository postTagRepository;
    private final PostRepository postRepository;
    private final TagRepository tagRepository;
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

    @Override
    @Transactional
    public PostTagResponse createPostTag(PostTagRequest request) {
        validatePost(request.postId());
        validateTag(request.tagId());

        PostTagEntity entity = postTagMapStruct.toEntity(request);
        postTagRepository.insertPostTag(entity);

        return postTagMapStruct.toResponse(entity);
    }

    @Override
    @Transactional
    public void deletePostTag(Long postId, Long tagId) {
        validatePost(postId);
        validateTag(tagId);
        postTagRepository.deletePostTag(postId, tagId);
    }

    @Override
    @Transactional
    public void replacePostTags(ReplacePostTagRequest request) {
        validatePost(request.postId());

        postTagRepository.deleteAllPostTagByPostId(request.postId());

        if (request.tagIds() == null || request.tagIds().isEmpty()) {
            return;
        }

        Set<Long> uniqueTagIds = new LinkedHashSet<>(request.tagIds());

        for (Long tagId : uniqueTagIds) {
            validateTag(tagId);
            postTagRepository.insertPostTag(
                    PostTagEntity.builder()
                            .postId(request.postId())
                            .tagId(tagId)
                            .build()
            );
        }
    }

    private void validatePost(Long postId) {
        PostEntity postEntity = postRepository.getPostDetail(postId);
        if (postEntity == null || Boolean.TRUE.equals(postEntity.getIsDeleted())) {
            throw new BaseException(CommunityMessages.COMMUNITY_POST_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }

    private void validateTag(Long tagId) {
        TagEntity tagEntity = tagRepository.getTagDetail(tagId);
        if (tagEntity == null || Boolean.TRUE.equals(tagEntity.getIsDeleted())) {
            throw new BaseException(CommunityMessages.COMMUNITY_TAG_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }
}
