package com.dawne.com2usbaseball.domain.community.repository;

import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import com.dawne.com2usbaseball.domain.community.repository.mapper.PostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@RequiredArgsConstructor
@Repository
public class PostRepository {

    private final PostMapper mapper;

    public List<PostsEntity> selectPostItems() {
        return mapper.selectPosts();
    }

    public boolean insertNewPost(PostsEntity posts) {
        return mapper.insertNewPost(posts) > 0;
    }

    public boolean updatePost(PostsEntity posts) {
        return mapper.updatePost(posts) > 0;
    }
}
