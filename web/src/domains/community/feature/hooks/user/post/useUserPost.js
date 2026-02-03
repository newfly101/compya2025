import { requestInsertNewPost } from "@/domains/community/store/index.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

export const useUserPost = () => {
  const dispatch = useDispatch();
  const { postLists } = useSelector((state) => state.community);

  // todo: sample 전체 불러오기 -> 게시판 마다 불러오기로 변경해야 함
  useEffect(() => {
    dispatch(requestInsertNewPost());
  }, [dispatch]);

  const handleAddViewCount = () => {
    // todo: 링크 클릭 할 때 viewcount 더해주는 api 호출
    // dispatch(requestInsertNewPost());
  }

  return {
    postLists,
    handleAddViewCount
  };

};
