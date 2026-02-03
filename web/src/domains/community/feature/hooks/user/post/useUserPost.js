import { requestGetAllPostLists } from "@/domains/community/store/index.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useUserPost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { postLists } = useSelector((state) => state.community);

  // todo: sample 전체 불러오기 -> 게시판 마다 불러오기로 변경해야 함
  useEffect(() => {
    dispatch(requestGetAllPostLists());
  }, [dispatch]);

  const handleAddViewCount = (post) => {
    // todo: 링크 클릭 할 때 viewcount 더해주는 api 호출
    // dispatch(requestInsertNewPost());

    if (post.linkType === "EXTERNAL" && post.externalUrl) {
      window.open(post.externalUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/community/posts/${post.id}`);
    }
  }
  const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(
      () => window.matchMedia(query).matches
    );

    useEffect(() => {
      const media = window.matchMedia(query);
      const listener = () => setMatches(media.matches);

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  };

  return {
    postLists,
    handleAddViewCount,
    useMediaQuery
  };

};
