import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetAllBoardLists } from "@/domains/community/store/index.js";


export const useBoards = () => {
  const dispatch = useDispatch();
  const { boardLists } = useSelector((state) => state.community);

  useEffect(() => {
    dispatch(requestGetAllBoardLists());
  }, [dispatch]);

  return {
    boardLists
  };
};
