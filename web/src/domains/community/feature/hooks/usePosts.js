import { useEffect, useState } from "react";

const MOCK_POSTS = {
  TIP: [
    {
      id: 1,
      title: "뉴비를 위한 초반 팁",
      authorName: "관리자",
      createdAt: "2025-01-01",
      viewCount: 123,
    },
  ],
  FREE: [
    {
      id: 2,
      title: "자유게시판 첫 글",
      authorName: "user01",
      createdAt: "2025-01-02",
      viewCount: 45,
    },
  ],
  CLUB: [],
};

export const usePosts = (boardCode) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // 🔹 나중에 API 호출로 교체
    setPosts(MOCK_POSTS[boardCode] ?? []);
  }, [boardCode]);

  return posts;
};
