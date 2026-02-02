package com.dawne.com2usbaseball.domain.community.service.posts.support;

import com.dawne.com2usbaseball.domain.community.dto.response.posts.PostListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.PostResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("postListMaker")
public class ListMaker {

    public PostListResponse makePostListMaker(List<PostsEntity> postLists) {
        List<PostResponse> posts = postLists.stream()
                .map(PostResponse::from)
                .toList();

        return PostListResponse.of(posts);
    }
}
