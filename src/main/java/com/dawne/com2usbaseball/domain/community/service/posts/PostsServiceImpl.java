package com.dawne.com2usbaseball.domain.community.service.posts;

import com.dawne.com2usbaseball.common.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.posts.PostListResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostsEntity;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.repository.BoardRepository;
import com.dawne.com2usbaseball.domain.community.repository.PostRepository;
import com.dawne.com2usbaseball.domain.community.service.posts.support.ListMaker;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.javassist.NotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional
public class PostsServiceImpl implements PostsService {

    @Resource(name = "postListMaker")
    private final ListMaker listMaker;
    private final PostRepository repository;
    private final BoardRepository boardRepository;

    @Override
    @Transactional(readOnly = true)
    public PostListResponse selectAllPostLists() {
        List<PostsEntity> boards = repository.selectPostItems();

        return listMaker.makePostListMaker(boards);
    }

    @Override
    @CacheEvict(value = "adminPosts", allEntries = true)
    public OperationResponse<CommunityMessages> createNewPostItem(PostsEntity posts) {
        return repository.insertNewPost(posts)
                ? OperationResponse.success(CommunityMessages.POST_CREATED, posts.getId())
                : OperationResponse.fail(CommunityMessages.POST_FAILED);
    }

    @Override
    @CacheEvict(value = "adminPosts", allEntries = true)
    public OperationResponse<CommunityMessages> updatePostItem(PostsEntity posts) {
        return repository.updatePost(posts)
                ? OperationResponse.success(CommunityMessages.POST_UPDATED, posts.getId())
                : OperationResponse.fail(CommunityMessages.POST_FAILED);
    }

    // User Get Post List
    @Override
    @Transactional(readOnly = true)
    public PostListResponse selectPostListsByBoard(Long boardId) throws NotFoundException {
        // 검증
        if (!boardRepository.existsById(boardId)) {
            throw new NotFoundException("BOARD_NOT_FOUND");
        }

        List<PostsEntity> boards = repository.selectUserPostByBoardId(boardId);

        return listMaker.makePostListMaker(boards);
    }
}
