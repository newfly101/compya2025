import { requestGetUserPostListsByBoardId } from "@/domains/community/store/index.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useUserPost = (activeBoardId) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { postLists } = useSelector((state) => state.community);

  useEffect(() => {
    if (!activeBoardId) return;
    dispatch(requestGetUserPostListsByBoardId(activeBoardId));
  }, [dispatch, activeBoardId]);

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
