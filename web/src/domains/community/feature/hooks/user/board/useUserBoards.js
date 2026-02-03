import { requestGetUserBoardLists, setActiveBoard } from "@/domains/community/store/index.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

export const useUserBoard = () => {
  const dispatch = useDispatch();
  const { boardLists, activeBoardId } = useSelector((state) => state.community);

  useEffect(() => {
      dispatch(requestGetUserBoardLists());
  }, [dispatch]);

  useEffect(() => {
    if (!activeBoardId && boardLists.length > 0) {
      dispatch(setActiveBoard(boardLists[0]?.id));
    }
  }, [boardLists, activeBoardId, dispatch]);

  const selectBoard = (boardId) => {
    dispatch(setActiveBoard(boardId));
  };

  return {
    boardLists,
    activeBoardId,
    selectBoard,
  };

};
