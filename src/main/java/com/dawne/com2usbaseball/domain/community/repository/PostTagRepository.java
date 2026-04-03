package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.PostTagEntity;
import com.dawne.com2usbaseball.domain.community.repository.mapper.PostTagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostTagRepository {

    private final PostTagMapper postTagMapper;

    public List<PostTagEntity> getPostTagListByPostId(Long postId) {
        return postTagMapper.getPostTagListByPostId(postId);
    }

    public List<PostTagEntity> getPostTagListByTagId(Long tagId) {
        return postTagMapper.getPostTagListByTagId(tagId);
    }

    public int insertPostTag(PostTagEntity entity) {
        return postTagMapper.insertPostTag(entity);
    }

    public int deletePostTag(Long postId, Long tagId) {
        return postTagMapper.deletePostTag(postId, tagId);
    }

    public int deleteAllPostTagByPostId(Long postId) {
        return postTagMapper.deleteAllPostTagByPostId(postId);
    }
}
