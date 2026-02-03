import { requestGetUserBoardLists } from "@/domains/community/store/index.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

export const useUserBoard = () => {
  const dispatch = useDispatch();
  const { boardLists } = useSelector((state) => state.community);

  useEffect(() => {
    dispatch(requestGetUserBoardLists());
  }, [dispatch]);

  return {
    boardLists,
  };

};
