package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.domain.community.dto.response.posts.InsertPostsResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.PostListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.UpdatePostsResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import com.dawne.com2usbaseball.domain.community.repository.PostRepository;
import com.dawne.com2usbaseball.domain.community.service.posts.support.ListMaker;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class PostsServiceImpl implements PostsService {

    @Resource(name = "postListMaker")
    private final ListMaker listMaker;
    private final PostRepository repository;

    @Override
    public PostListResponse selectAllPostLists() {
        List<PostsEntity> boards = repository.selectPostItems();

        return listMaker.makePostListMaker(boards);
    }

    @Override
    public InsertPostsResponse createNewPostItem(PostsEntity posts) {
        boolean success = repository.insertNewPost(posts);

        if (!success) {
            return InsertPostsResponse.fail();
        }

        return InsertPostsResponse.success(posts.getId());
    }

    @Override
    public UpdatePostsResponse updatePostItem(PostsEntity posts) {
        boolean success = repository.updatePost(posts);

        if (!success) {
            return UpdatePostsResponse.fail();
        }

        return UpdatePostsResponse.success(posts.getId());
    }
}
